import type { Preset } from '../types.js';

export const rustPreset: Preset = {
  id: 'rust',
  name: 'Rust',
  description: 'Rust rules for ownership, error handling, and trait patterns',
  detect: (scan) => scan.language === 'rust',
  sections: (_scan) => [
    {
      id: 'rust-ownership',
      title: 'Rust Ownership & Borrowing',
      content: `- **Prefer borrowing over cloning** — pass references (\`&T\` or \`&mut T\`) instead of cloning data. Only clone when you genuinely need an independent copy of the data:
  \`\`\`rust
  // Good: borrows the string
  fn process(data: &str) -> Result<Output> { ... }

  // Bad: takes ownership unnecessarily, forces caller to clone
  fn process(data: String) -> Result<Output> { ... }
  \`\`\`
- Use \`&str\` for **string parameters** instead of \`String\` — \`&str\` accepts both \`&String\` and string literals, making the function more flexible. Only take \`String\` when you need ownership (storing in a struct)
- Use \`impl Trait\` in **function parameters** for accepting any type that implements a trait — this is more readable than generic bounds for simple cases:
  \`\`\`rust
  // Good: clear and concise
  fn write_data(writer: &mut impl Write) -> io::Result<()> { ... }

  // Also good for multiple bounds or where clauses
  fn process<T: Read + Seek>(input: &mut T) -> Result<()> { ... }
  \`\`\`
- **Return concrete types** from functions — use \`impl Trait\` in return position only when the concrete type is complex or when you want to hide implementation details (e.g., \`impl Iterator<Item = u32>\`)
- Use \`Cow<'_, str>\` when a function **sometimes needs to allocate** and sometimes can borrow — avoids unnecessary allocations:
  \`\`\`rust
  fn normalize(input: &str) -> Cow<'_, str> {
      if input.contains(' ') {
          Cow::Owned(input.replace(' ', "_"))
      } else {
          Cow::Borrowed(input)
      }
  }
  \`\`\`
- Prefer **iterators and iterator chains** over manual loops — \`.iter().filter().map().collect()\` is idiomatic, often more readable, and enables compiler optimizations
- Use \`AsRef<T>\` and \`Into<T>\` for **flexible function signatures** — \`fn open(path: impl AsRef<Path>)\` accepts \`&str\`, \`String\`, and \`PathBuf\`
- Keep **lifetimes simple** — if the compiler can infer lifetimes through elision rules, do not annotate them. Only add explicit lifetimes when the compiler requires disambiguation`,
      priority: 'high',
      tags: ['rust', 'ownership', 'borrowing', 'lifetimes', 'memory'],
    },
    {
      id: 'rust-errors',
      title: 'Rust Error Handling',
      content: `- Use **\`thiserror\`** for defining error types in libraries — it generates \`Display\` and \`Error\` implementations with clear, structured error variants:
  \`\`\`rust
  #[derive(Debug, thiserror::Error)]
  pub enum AppError {
      #[error("database query failed: {0}")]
      Database(#[from] sqlx::Error),
      #[error("user {id} not found")]
      UserNotFound { id: i64 },
      #[error("validation failed: {0}")]
      Validation(String),
  }
  \`\`\`
- Use **\`anyhow\`** for application-level error handling — it provides a catch-all \`anyhow::Result<T>\` that can hold any error type, with context chaining:
  \`\`\`rust
  use anyhow::{Context, Result};

  fn load_config() -> Result<Config> {
      let content = fs::read_to_string("config.toml")
          .context("failed to read config file")?;
      let config: Config = toml::from_str(&content)
          .context("failed to parse config file")?;
      Ok(config)
  }
  \`\`\`
- Use the **\`?\` operator** for error propagation — it is more readable than \`match\` or \`unwrap\` and automatically converts errors using \`From\` implementations
- **Never use \`unwrap()\` in production code** — it panics on \`None\` or \`Err\`. Use \`expect("reason")\` only when you can prove the value is always present, with a clear explanation of why
- Use \`unwrap()\` and \`expect()\` freely in **tests** — panicking in tests is the desired behavior on failure
- Map errors with \`.map_err()\` when converting between error types that do not have a \`From\` implementation
- Use \`Option<T>\` for values that may be absent — prefer \`.unwrap_or_default()\`, \`.unwrap_or_else()\`, or pattern matching over \`.unwrap()\`
- Define **error enums per module/crate** — each library crate should have its own error type. Application crates can use \`anyhow\` to combine them
- Add **context to errors** at call sites — use \`.context()\` from anyhow or create descriptive error variants that explain what operation failed and why`,
      priority: 'high',
      tags: ['rust', 'errors', 'thiserror', 'anyhow', 'result'],
    },
    {
      id: 'rust-patterns',
      title: 'Rust Design Patterns',
      content: `- Use the **Builder pattern** for constructing types with many optional fields — avoids constructors with long parameter lists and makes intent clear:
  \`\`\`rust
  let client = HttpClient::builder()
      .timeout(Duration::from_secs(30))
      .max_retries(3)
      .base_url("https://api.example.com")
      .build()?;
  \`\`\`
- Use the **Newtype pattern** for type safety — wrap primitive types to prevent mixing up semantically different values:
  \`\`\`rust
  struct UserId(i64);
  struct OrderId(i64);

  // Compiler prevents: process_order(user_id) when OrderId is expected
  fn process_order(order_id: OrderId) -> Result<()> { ... }
  \`\`\`
- Use **enums for state machines** — Rust enums with data are perfect for modeling states with associated data, and \`match\` ensures all states are handled:
  \`\`\`rust
  enum ConnectionState {
      Disconnected,
      Connecting { attempt: u32 },
      Connected { session_id: String },
      Failed { error: String, retries: u32 },
  }
  \`\`\`
- Use **traits for polymorphism** — define behavior contracts with trait definitions, provide default implementations where sensible, and use trait objects (\`dyn Trait\`) for dynamic dispatch:
  \`\`\`rust
  trait Storage: Send + Sync {
      async fn get(&self, key: &str) -> Result<Option<Vec<u8>>>;
      async fn set(&self, key: &str, value: &[u8]) -> Result<()>;
      async fn delete(&self, key: &str) -> Result<()>;
  }
  \`\`\`
- Implement \`From<T>\` for **type conversions** — use \`impl From<SourceType> for TargetType\` which automatically provides \`Into\` in the other direction
- Use **\`derive\` macros** extensively — derive \`Debug\`, \`Clone\`, \`PartialEq\`, \`Eq\`, \`Hash\`, \`Serialize\`, \`Deserialize\` as appropriate. Only implement manually when custom behavior is needed
- Prefer **composition over inheritance** — embed types as struct fields rather than trying to simulate inheritance. Use traits for shared behavior
- Use \`#[must_use]\` attribute on functions that return \`Result\` or important values — ensures callers do not accidentally ignore return values`,
      priority: 'medium',
      tags: ['rust', 'patterns', 'builder', 'newtype', 'enums', 'traits'],
    },
  ],
};
