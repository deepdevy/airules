import type { Preset } from '../types.js';

export const fastapiPreset: Preset = {
  id: 'fastapi',
  name: 'FastAPI',
  description: 'FastAPI rules for Pydantic models, dependency injection, and async handlers',
  detect: (scan) => scan.framework === 'fastapi',
  sections: (_scan) => [
    {
      id: 'fastapi-structure',
      title: 'FastAPI Application Structure',
      content: `- Define **Pydantic models** for all request bodies and response schemas — never use raw dicts for API input/output:
  \`\`\`python
  class UserCreate(BaseModel):
      email: EmailStr
      name: str = Field(min_length=1, max_length=100)
      role: Literal["admin", "user"] = "user"

  class UserResponse(BaseModel):
      id: int
      email: str
      name: str
      model_config = ConfigDict(from_attributes=True)
  \`\`\`
- Use **APIRouter** to organize endpoints into modules — group related endpoints in separate router files:
  \`\`\`python
  # routers/users.py
  router = APIRouter(prefix="/users", tags=["users"])

  @router.get("/", response_model=list[UserResponse])
  async def list_users(db: Session = Depends(get_db)):
      return await user_service.list_all(db)
  \`\`\`
- Use **dependency injection** with \`Depends()\` for shared logic — database sessions, authentication, pagination, and configuration should all be injected:
  \`\`\`python
  async def get_db() -> AsyncGenerator[AsyncSession, None]:
      async with async_session() as session:
          yield session
  \`\`\`
- Use **async handlers by default** (\`async def\`) — FastAPI runs sync handlers in a threadpool which adds overhead. Only use sync \`def\` for CPU-bound operations
- Separate concerns: \`routers/\` for endpoint definitions, \`schemas/\` for Pydantic models, \`services/\` for business logic, \`models/\` for ORM models, \`dependencies/\` for injectable dependencies
- Configure the app with **lifespan** context manager for startup/shutdown events — initialize database connections, caches, and background workers in lifespan`,
      priority: 'high',
      tags: ['fastapi', 'architecture', 'pydantic', 'structure'],
    },
    {
      id: 'fastapi-patterns',
      title: 'FastAPI Development Patterns',
      content: `- Use **type hints everywhere** — FastAPI uses them for request parsing, validation, serialization, and OpenAPI documentation generation. Every parameter, return type, and variable should be typed
- Create **separate Pydantic models** for different operations on the same resource:
  - \`UserCreate\` — fields required for creation (no id)
  - \`UserUpdate\` — all fields optional for partial updates
  - \`UserResponse\` — fields returned to the client (no password)
  - \`UserInDB\` — internal model with hashed password
- Use \`Depends()\` for **dependency injection** at all levels — route, router, and app-wide:
  \`\`\`python
  async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
      user = await verify_token(token)
      if not user:
          raise HTTPException(status_code=401, detail="Invalid token")
      return user
  \`\`\`
- Use **BackgroundTasks** for non-blocking operations that do not affect the response — email sending, log writing, webhook delivery:
  \`\`\`python
  @router.post("/users/", status_code=201)
  async def create_user(user: UserCreate, background_tasks: BackgroundTasks):
      new_user = await user_service.create(user)
      background_tasks.add_task(send_welcome_email, new_user.email)
      return new_user
  \`\`\`
- Return **proper HTTP status codes** — use \`status_code\` parameter on route decorators: 201 for creation, 204 for deletion, raise \`HTTPException\` for errors with appropriate codes
- Use \`Query()\`, \`Path()\`, and \`Body()\` for **parameter validation and documentation** — add descriptions, examples, and constraints directly in the function signature
- Define **custom exception handlers** for consistent error response format across the application — override default validation error responses for cleaner API errors`,
      priority: 'high',
      tags: ['fastapi', 'patterns', 'typing', 'pydantic', 'dependency-injection'],
    },
    {
      id: 'fastapi-security',
      title: 'FastAPI Security',
      content: `- Implement **OAuth2 with JWT** for authentication — use FastAPI's built-in \`OAuth2PasswordBearer\` scheme and create a \`get_current_user\` dependency:
  \`\`\`python
  oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

  async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
      payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
      user = await get_user_by_id(payload["sub"])
      if not user:
          raise HTTPException(status_code=401)
      return user

  async def require_admin(user: User = Depends(get_current_user)) -> User:
      if user.role != "admin":
          raise HTTPException(status_code=403, detail="Admin access required")
      return user
  \`\`\`
- Apply authentication as a **dependency** on routes, routers, or the entire app — use \`Depends(get_current_user)\` on protected endpoints
- Configure **CORS middleware** with explicit origins — never use \`allow_origins=["*"]\` in production:
  \`\`\`python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://app.example.com"],
      allow_methods=["GET", "POST", "PUT", "DELETE"],
      allow_headers=["Authorization"],
      allow_credentials=True,
  )
  \`\`\`
- Rely on **Pydantic validation** as the first line of defense against malicious input — Pydantic automatically validates types, string lengths, email formats, and custom validators
- Never expose internal error details in production — configure custom exception handlers to return generic error messages while logging full tracebacks server-side
- Use **environment variables** for secrets — load with \`pydantic-settings\` BaseSettings class for type-safe configuration with validation
- Hash passwords with **bcrypt** via \`passlib\` — never store plaintext passwords. Use \`pwd_context.hash()\` and \`pwd_context.verify()\`
- Implement **rate limiting** middleware to prevent abuse — use \`slowapi\` or custom middleware to limit requests per IP/user`,
      priority: 'medium',
      tags: ['fastapi', 'security', 'authentication', 'cors', 'jwt'],
    },
  ],
};
