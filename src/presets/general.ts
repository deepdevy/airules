import type { Preset, RuleSection, ScanResult } from '../types.js';

function buildCodeStyleSection(scan: ScanResult): RuleSection {
  const frameworkHint = scan.framework
    ? `\n- Follow ${scan.framework} conventions and idioms when writing components, routes, and utilities`
    : '';

  return {
    id: 'code-style',
    title: 'Code Style & Conventions',
    content: `- Follow existing code patterns in this codebase — match the style of surrounding files before introducing new patterns
- **Naming conventions:**
  - \`camelCase\` for variables, functions, and method names
  - \`PascalCase\` for classes, types, interfaces, and components
  - \`UPPER_SNAKE_CASE\` for constants and enum values
  - Use descriptive names that reveal intent — avoid single-letter variables except in short lambdas (\`x => x.id\`)
- Keep functions small and focused on a single responsibility — if a function needs a comment explaining sections, split it
- Use early returns to reduce nesting depth — guard clauses at the top of functions
- Comments explain **"why"**, not **"what"** — the code itself should be readable enough to explain what it does
- Avoid magic numbers and strings — extract them into named constants
- Prefer \`const\` over \`let\`; never use \`var\`
- Use template literals over string concatenation for multi-part strings${frameworkHint}`,
    priority: 'high',
    tags: ['style'],
  };
}

function buildErrorHandlingSection(): RuleSection {
  return {
    id: 'error-handling',
    title: 'Error Handling',
    content: `- **Never silently swallow errors** — no empty \`catch\` blocks; at minimum, log the error
- Use specific error types/classes, not generic \`Error\` — e.g., \`ValidationError\`, \`NotFoundError\`, \`AuthenticationError\`
- Include meaningful error messages with context: \`\`"Failed to fetch user \${userId}: \${cause}"\`\` not just \`"Something went wrong"\`
- Handle edge cases explicitly: check for \`null\`, \`undefined\`, empty arrays, and empty strings before operating on data
- Always handle promise rejections — use \`try/catch\` in \`async\` functions or \`.catch()\` on promise chains
- Fail fast: validate inputs at function boundaries before doing work
- Distinguish between expected errors (validation failures, not-found) and unexpected errors (network failures, bugs) — handle them differently
- Never expose raw stack traces or internal error details to end users in API responses`,
    priority: 'high',
    tags: ['errors', 'reliability'],
  };
}

function buildSecuritySection(): RuleSection {
  return {
    id: 'security',
    title: 'Security',
    content: `- **Never hardcode secrets**, API keys, passwords, or credentials in source code — use environment variables or a secrets manager
- Do not commit \`.env\` files, private keys, or credential files to version control
- Validate and sanitize all user inputs on the server side — never trust client-side validation alone
- Use parameterized queries or ORM methods for all database operations — never concatenate user input into SQL strings
- Never expose internal error details, stack traces, or system information to end users
- Apply the principle of least privilege — request only the permissions and scopes actually needed
- Escape output when rendering user-provided content to prevent XSS attacks
- Set appropriate security headers (\`Content-Security-Policy\`, \`X-Frame-Options\`, etc.) in web applications`,
    priority: 'high',
    tags: ['security'],
  };
}

function buildProjectStructureSection(scan: ScanResult): RuleSection {
  const dirList =
    scan.directories.length > 0
      ? `\n- **Detected project directories:** \`${scan.directories.join('`, `')}\` — place new files in the appropriate existing directory`
      : '';

  const monorepoHint = scan.monorepo
    ? `\n- This is a **monorepo** — keep package boundaries clear, avoid cross-package imports that bypass the package's public API, and ensure changes are scoped to the correct package`
    : '';

  const frameworkStructure = scan.framework
    ? `\n- Follow ${scan.framework} project structure conventions — place routes, components, utilities, and configuration in their standard locations`
    : '';

  return {
    id: 'project-structure',
    title: 'Project Structure',
    content: `- Respect the existing project structure — do not reorganize directories unless explicitly asked
- Place new files in the directory that matches their purpose and follows existing patterns
- Keep related files close together (co-location) — tests next to source, styles next to components
- Avoid deeply nested directory structures — prefer flat hierarchies within feature directories${dirList}${monorepoHint}${frameworkStructure}`,
    priority: 'medium',
    tags: ['structure'],
  };
}

function buildDependenciesSection(scan: ScanResult): RuleSection {
  const pmHint = scan.packageManager
    ? `\n- Use \`${scan.packageManager}\` for package management — do not mix package managers in this project`
    : '';

  return {
    id: 'dependencies',
    title: 'Dependencies',
    content: `- **Prefer existing project dependencies** over adding new ones — check \`package.json\` (or equivalent) before suggesting a new library
- Before adding a dependency, verify it is actively maintained, has no known vulnerabilities, and is appropriate for the project's size
- Keep imports organized: external/third-party packages first, then internal modules, then relative imports
- Avoid importing entire libraries when only a small utility is needed — use specific imports (\`import { debounce } from 'lodash-es'\` not \`import _ from 'lodash'\`)
- Pin dependency versions in production applications; use ranges in libraries${pmHint}`,
    priority: 'medium',
    tags: ['deps'],
  };
}

function buildTestingSection(scan: ScanResult): RuleSection {
  const testFrameworkHint = scan.testing
    ? `\n- Use \`${scan.testing}\` for testing — it is already configured in this project`
    : '';

  return {
    id: 'testing',
    title: 'Testing',
    content: `- Write tests for all new functionality — if you write code, write a test for it
- Follow existing test patterns and conventions in the codebase — match file naming, describe/it structure, and assertion style
- Test edge cases and error paths, not just the happy path — empty inputs, nulls, boundary values, and error conditions
- Keep tests focused: one logical assertion per test, descriptive test names that explain the scenario
- Use descriptive test names: \`"returns empty array when user has no orders"\` not \`"test 1"\`
- Mock external dependencies (APIs, databases, file system) but avoid mocking internal modules excessively
- Tests should be deterministic — no flaky tests that depend on timing, network, or random data${testFrameworkHint}`,
    priority: 'medium',
    tags: ['testing'],
  };
}

function buildGitConventionsSection(): RuleSection {
  return {
    id: 'git-conventions',
    title: 'Git Conventions',
    content: `- Write clear, descriptive commit messages — use the imperative mood: \`"Add user authentication"\` not \`"Added user authentication"\`
- Keep commits focused on a single logical change — don't mix refactoring with feature work
- Never commit secrets, \`.env\` files, API keys, or credentials — add them to \`.gitignore\`
- Never commit large generated files, build artifacts, or \`node_modules\`
- Review diffs before committing to avoid accidental changes (debug logs, commented-out code, unrelated formatting)`,
    priority: 'low',
    tags: ['git'],
  };
}

export const generalPreset: Preset = {
  id: 'general',
  name: 'General',
  description: 'Language-agnostic base rules for code style, error handling, and documentation',
  detect: () => true, // always applies
  sections: (scan: ScanResult): RuleSection[] => {
    return [
      buildCodeStyleSection(scan),
      buildErrorHandlingSection(),
      buildSecuritySection(),
      buildProjectStructureSection(scan),
      buildDependenciesSection(scan),
      buildTestingSection(scan),
      buildGitConventionsSection(),
    ];
  },
};
