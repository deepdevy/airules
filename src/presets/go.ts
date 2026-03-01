import type { Preset } from '../types.js';

export const goPreset: Preset = {
  id: 'go',
  name: 'Go',
  description: 'Go rules for error handling, interfaces, and project structure',
  detect: (scan) => scan.language === 'go',
  sections: (_scan) => [
    {
      id: 'go-conventions',
      title: 'Go Language Conventions',
      content: `- Return \`error\` as the **last return value** from functions that can fail — this is the universal Go convention. Never use panics for expected error conditions:
  \`\`\`go
  func ReadConfig(path string) (*Config, error) {
      data, err := os.ReadFile(path)
      if err != nil {
          return nil, fmt.Errorf("reading config %s: %w", path, err)
      }
      // ...
  }
  \`\`\`
- **Check errors immediately** after every function call that returns one — never ignore errors with \`_\`. Use \`if err != nil { return ..., err }\` pattern:
  \`\`\`go
  result, err := doSomething()
  if err != nil {
      return fmt.Errorf("doing something: %w", err)
  }
  \`\`\`
- **Wrap errors with context** using \`fmt.Errorf("context: %w", err)\` — this preserves the error chain for \`errors.Is()\` and \`errors.As()\` while adding actionable context
- Never use \`panic()\` in **library code** — panics are only acceptable for truly unrecoverable situations during initialization (e.g., invalid regex compilation). Application code should handle panics gracefully
- Use **PascalCase** for exported (public) identifiers and **camelCase** for unexported (private) identifiers — this is enforced by the language, not a style preference
- Name interfaces with the \`-er\` suffix when they have a single method: \`Reader\`, \`Writer\`, \`Closer\`, \`Stringer\`. For multi-method interfaces, use descriptive nouns
- Use **short variable names** in small scopes (i, j, k, v, err, ctx) and descriptive names in larger scopes — Go favors brevity where context is clear
- Run \`go fmt\` (or \`gofmt\`) on all code — formatting is standardized in Go. Use \`goimports\` to also manage import ordering
- Use \`go vet\` and \`staticcheck\` in CI — they catch common bugs like unreachable code, incorrect format strings, and misuse of sync primitives`,
      priority: 'high',
      tags: ['go', 'conventions', 'errors', 'naming', 'style'],
    },
    {
      id: 'go-patterns',
      title: 'Go Design Patterns',
      content: `- **Accept interfaces, return structs** — function parameters should be interfaces (for flexibility and testability), but return concrete types (for clarity):
  \`\`\`go
  // Good: accepts io.Reader interface, returns concrete *Report
  func ParseReport(r io.Reader) (*Report, error) { ... }

  // Bad: accepts concrete *os.File, limits callers
  func ParseReport(f *os.File) (*Report, error) { ... }
  \`\`\`
- Write **table-driven tests** for functions with multiple input/output scenarios — define test cases as a slice of structs and iterate with subtests:
  \`\`\`go
  tests := []struct {
      name    string
      input   string
      want    int
      wantErr bool
  }{
      {"valid", "42", 42, false},
      {"negative", "-1", -1, false},
      {"invalid", "abc", 0, true},
  }
  for _, tt := range tests {
      t.Run(tt.name, func(t *testing.T) {
          got, err := Parse(tt.input)
          // assertions...
      })
  }
  \`\`\`
- **Propagate context** (\`context.Context\`) as the first parameter to all functions that perform I/O, database queries, or HTTP calls — respect cancellation and deadlines:
  \`\`\`go
  func (s *Service) GetUser(ctx context.Context, id string) (*User, error) {
      return s.db.QueryContext(ctx, "SELECT ...")
  }
  \`\`\`
- Manage **goroutine lifecycles** explicitly — every goroutine must have a clear shutdown mechanism. Use \`context.WithCancel\`, \`sync.WaitGroup\`, or channels to coordinate:
  \`\`\`go
  g, ctx := errgroup.WithContext(ctx)
  g.Go(func() error { return processA(ctx) })
  g.Go(func() error { return processB(ctx) })
  if err := g.Wait(); err != nil { ... }
  \`\`\`
- Use \`defer\` for **cleanup operations** — closing files, releasing locks, stopping timers. Defer runs in LIFO order when the function returns
- Define **small, focused interfaces** — prefer multiple small interfaces over one large one. Compose interfaces when needed: \`type ReadCloser interface { Reader; Closer }\`
- Use **channels for communication** between goroutines and **mutexes for protecting shared state** — prefer channels when goroutines need to coordinate work sequences`,
      priority: 'high',
      tags: ['go', 'patterns', 'testing', 'concurrency', 'interfaces'],
    },
    {
      id: 'go-structure',
      title: 'Go Project Structure',
      content: `- Use \`cmd/\` directory for **application entrypoints** — each subdirectory is a separate binary with its own \`main.go\`:
  \`\`\`
  cmd/
    server/main.go    — HTTP server binary
    worker/main.go    — background worker binary
    cli/main.go       — CLI tool binary
  \`\`\`
- Use \`internal/\` directory for **private packages** — code in \`internal/\` cannot be imported by external modules. This is enforced by the Go toolchain, not just convention
- Use \`pkg/\` directory for **public library code** that other projects can import — only use this if you intentionally want to share code as a library. Many projects skip \`pkg/\` entirely
- Prefer a **flat package structure** over deeply nested directories — Go packages should be organized by domain/feature, not by technical layer:
  \`\`\`
  # Good: flat, domain-oriented
  internal/user/      — user domain logic
  internal/order/     — order domain logic
  internal/auth/      — authentication

  # Avoid: deeply nested layer-based
  internal/controllers/user/
  internal/services/user/
  internal/repositories/user/
  \`\`\`
- Keep package names **short, lowercase, and singular** — use \`user\` not \`users\`, \`http\` not \`httputil\`. The package name is part of every identifier: \`user.New()\` reads better than \`users.New()\`
- Place **configuration** in a dedicated package (\`internal/config/\`) — load from environment variables using \`os.Getenv()\` with defaults and validation at startup
- Put **database migrations** in a top-level \`migrations/\` or \`db/migrations/\` directory — use tools like \`goose\`, \`migrate\`, or \`atlas\` for schema management
- Use \`Makefile\` or \`Taskfile.yml\` for common development commands — build, test, lint, run, docker commands should all be one-liners
- Define \`wire.go\` or a manual \`NewApp()\` constructor for **dependency injection** — pass dependencies explicitly through constructors, avoid global variables and \`init()\` functions`,
      priority: 'medium',
      tags: ['go', 'structure', 'project-layout', 'packages', 'organization'],
    },
  ],
};
