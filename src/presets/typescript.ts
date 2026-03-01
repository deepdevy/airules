import type { Preset, RuleSection } from '../types.js';

function buildTypeSafetySection(): RuleSection {
  return {
    id: 'type-safety',
    title: 'Type Safety',
    content: `- **Never use \`any\`** — use \`unknown\` and narrow with type guards (\`typeof\`, \`instanceof\`, discriminated unions, or custom type predicates)
- **Never use \`@ts-ignore\` or \`@ts-expect-error\`** — fix the underlying type error instead; if the types are wrong, declare a proper type or augment the module
- Prefer \`interface\` for defining object shapes (they support declaration merging and are more readable); use \`type\` for unions, intersections, and mapped types
- Use \`readonly\` for data that should not be mutated — \`readonly\` arrays, \`Readonly<T>\` for objects, and \`as const\` for literal tuples
- **Always explicitly type exported function parameters and return types** — internal/private functions can rely on inference
- Use discriminated unions over type assertions — add a \`kind\` or \`type\` field to distinguish variants:
  \`\`\`typescript
  type Result<T> = { ok: true; value: T } | { ok: false; error: Error };
  \`\`\`
- Avoid type assertions (\`as\`) — if you must narrow, use a type guard function instead
- Enable and respect \`strict: true\` in \`tsconfig.json\` — do not weaken compiler strictness`,
    priority: 'high',
    tags: ['typescript', 'types'],
  };
}

function buildTypescriptPatternsSection(): RuleSection {
  return {
    id: 'typescript-patterns',
    title: 'TypeScript Patterns',
    content: `- Use the \`satisfies\` operator for type-safe object literals that preserve their narrow type:
  \`\`\`typescript
  const config = { port: 3000, host: 'localhost' } satisfies ServerConfig;
  \`\`\`
- Prefer \`as const\` assertions for literal types and const enums over regular enums:
  \`\`\`typescript
  const ROLES = ['admin', 'user', 'guest'] as const;
  type Role = (typeof ROLES)[number];
  \`\`\`
- Use generic constraints (\`T extends Base\`) instead of \`any\` in generic functions — be as specific as the function requires
- Use \`Record<K, V>\` instead of \`{ [key: string]: V }\` for index signatures
- Prefer nullish coalescing \`??\` over logical OR \`||\` for default values — \`||\` treats \`0\`, \`""\`, and \`false\` as falsy
- Use optional chaining \`?.\` for nested property access instead of manual null checks
- Use \`Map\` and \`Set\` over plain objects when keys are dynamic or non-string
- Prefer \`Promise.all()\` over sequential \`await\` when operations are independent`,
    priority: 'high',
    tags: ['typescript', 'patterns'],
  };
}

function buildTypescriptImportsSection(): RuleSection {
  return {
    id: 'typescript-imports',
    title: 'TypeScript Imports',
    content: `- Use \`import type { ... }\` for type-only imports — this ensures they are erased at compile time and prevents circular dependency issues:
  \`\`\`typescript
  import type { User, UserRole } from './types.js';
  import { createUser } from './users.js';
  \`\`\`
- Organize imports in this order (with blank lines between groups):
  1. Type imports (\`import type { ... }\`)
  2. External packages (\`import express from 'express'\`)
  3. Internal/project modules (\`import { helper } from '../utils/helper.js'\`)
  4. Relative sibling imports (\`import { schema } from './schema.js'\`)
- Use \`.js\` extensions in import paths when targeting ESM (even for \`.ts\` source files)
- Avoid re-exporting everything with \`export * from\` — use explicit named exports for a clear public API`,
    priority: 'medium',
    tags: ['typescript', 'imports'],
  };
}

function buildTypescriptErrorsSection(): RuleSection {
  return {
    id: 'typescript-errors',
    title: 'TypeScript Error Handling',
    content: `- Create custom error classes extending \`Error\` with additional context:
  \`\`\`typescript
  class ValidationError extends Error {
    constructor(public readonly field: string, message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  }
  \`\`\`
- Use \`unknown\` in \`catch\` blocks (the default in strict mode) and narrow with \`instanceof\`:
  \`\`\`typescript
  try { ... } catch (err: unknown) {
    if (err instanceof ValidationError) { /* handle */ }
    throw err; // re-throw unexpected errors
  }
  \`\`\`
- Consider the **Result pattern** (discriminated union) for operations with expected failure modes — avoids exception-driven control flow:
  \`\`\`typescript
  type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
  \`\`\`
- Never use \`try/catch\` for control flow of expected conditions — use return values or discriminated unions instead
- Type your error responses and error payloads — don't leave error shapes as \`any\``,
    priority: 'medium',
    tags: ['typescript', 'errors'],
  };
}

export const typescriptPreset: Preset = {
  id: 'typescript',
  name: 'TypeScript',
  description: 'TypeScript-specific rules for type safety, interfaces, and compiler options',
  detect: (scan) => scan.language === 'typescript',
  sections: () => {
    return [
      buildTypeSafetySection(),
      buildTypescriptPatternsSection(),
      buildTypescriptImportsSection(),
      buildTypescriptErrorsSection(),
    ];
  },
};
