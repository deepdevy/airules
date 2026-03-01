import type { Preset } from '../types.js';

export const expressPreset: Preset = {
  id: 'express',
  name: 'Express',
  description: 'Express.js rules for middleware, routing, and error handling',
  detect: (scan) => scan.framework === 'express' || scan.dependencies['express'] !== undefined,
  sections: (_scan) => [
    {
      id: 'express-structure',
      title: 'Express Application Structure',
      content: `- Use **Router-level middleware** to organize routes into modules — create separate router files for each resource or domain:
  \`\`\`
  // routes/users.ts
  const router = Router();
  router.get('/', usersController.list);
  router.post('/', usersController.create);
  export default router;

  // app.ts
  app.use('/api/users', usersRouter);
  \`\`\`
- Follow the **Controller → Service → Repository** pattern to separate concerns:
  - **Route** defines the endpoint and applies middleware
  - **Controller** handles HTTP request/response (parse params, send response, set status codes)
  - **Service** contains business logic (validation rules, transformations, orchestration)
  - **Repository/Model** handles data access (database queries, external API calls)
- Keep \`app.ts\` clean — only define middleware stack and mount routers. Move server startup to a separate \`server.ts\` file
- Place **error-handling middleware at the end** of the middleware stack — it must have the signature \`(err, req, res, next)\` with all four parameters
- Group related files by feature/domain rather than by type: \`modules/users/\` containing \`users.router.ts\`, \`users.controller.ts\`, \`users.service.ts\` instead of flat \`controllers/\`, \`services/\` directories
- Export the Express app instance separately from the server listener — this enables testing the app without starting an HTTP server`,
      priority: 'high',
      tags: ['express', 'architecture', 'structure', 'mvc'],
    },
    {
      id: 'express-middleware',
      title: 'Express Middleware Best Practices',
      content: `- Apply middleware in the **correct order** — the sequence matters for security and functionality:
  1. \`helmet()\` — security headers
  2. \`cors()\` — CORS configuration
  3. \`express.json()\` and \`express.urlencoded()\` — body parsing
  4. Request logging middleware (morgan or custom)
  5. Authentication middleware
  6. Route handlers
  7. 404 handler (catch-all for unmatched routes)
  8. Error handler middleware (must be last)
- Wrap **async route handlers** to catch promise rejections — Express 4 does not catch async errors automatically:
  \`\`\`
  const asyncHandler = (fn: Function) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next);

  router.get('/', asyncHandler(async (req, res) => {
    const data = await service.findAll();
    res.json(data);
  }));
  \`\`\`
- Validate **request input** at the route level using Zod, Joi, or express-validator — never trust client input. Validate body, params, and query separately
- Create **reusable middleware** for cross-cutting concerns: authentication (\`requireAuth\`), authorization (\`requireRole('admin')\`), rate limiting, and request ID injection
- Always call \`next()\` in middleware unless you are sending a response — forgetting \`next()\` causes requests to hang indefinitely
- Set appropriate **response status codes** — use 201 for resource creation, 204 for successful deletion with no body, 400 for validation errors, 401 for unauthenticated, 403 for unauthorized, 404 for not found, 409 for conflicts`,
      priority: 'high',
      tags: ['express', 'middleware', 'async', 'validation'],
    },
    {
      id: 'express-security',
      title: 'Express Security Practices',
      content: `- Use **helmet** middleware to set security-related HTTP headers — it configures Content-Security-Policy, X-Content-Type-Options, Strict-Transport-Security, and other headers
- Configure **CORS** explicitly — never use \`cors()\` with no options in production. Specify allowed origins, methods, and headers:
  \`\`\`
  app.use(cors({
    origin: ['https://app.example.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    maxAge: 86400,
  }));
  \`\`\`
- Implement **rate limiting** with \`express-rate-limit\` on all API endpoints — apply stricter limits on authentication routes to prevent brute-force attacks
- **Sanitize all input** before processing — use libraries like \`express-mongo-sanitize\` to prevent NoSQL injection, strip HTML from user input to prevent XSS
- Never log **sensitive data** (passwords, tokens, credit card numbers, PII) — redact sensitive fields in request/response logs
- Use **parameterized queries** exclusively — never concatenate user input into SQL strings. Use your ORM's query builder or prepared statements
- Store **secrets in environment variables** — never hardcode API keys, database credentials, or JWT secrets. Use \`process.env\` with validation at startup
- Set \`express.json({ limit: '10kb' })\` to prevent **large payload attacks** — set appropriate body size limits for your use case
- Always serve over **HTTPS** in production — redirect HTTP to HTTPS and set \`secure: true\` on cookies
- Implement **request ID tracking** — attach a unique ID to each request for debugging and log correlation across services`,
      priority: 'medium',
      tags: ['express', 'security', 'cors', 'authentication'],
    },
  ],
};
