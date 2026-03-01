import { describe, it, expect } from 'vitest';
import type { ScanResult, RuleSection } from '../src/types.js';
import { generalPreset } from '../src/presets/general.js';
import { typescriptPreset } from '../src/presets/typescript.js';
import { detectPresets, getPreset, getAllPresetIds } from '../src/presets/index.js';

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function makeScan(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    language: 'unknown',
    framework: null,
    packageManager: null,
    styling: null,
    testing: null,
    orm: null,
    monorepo: false,
    directories: [],
    dependencies: {},
    ...overrides,
  };
}

function assertValidSection(section: RuleSection): void {
  expect(section.id).toBeTruthy();
  expect(typeof section.id).toBe('string');
  expect(section.title).toBeTruthy();
  expect(typeof section.title).toBe('string');
  expect(section.content).toBeTruthy();
  expect(typeof section.content).toBe('string');
  expect(section.content.length).toBeGreaterThan(10);
  expect(['high', 'medium', 'low']).toContain(section.priority);
  expect(Array.isArray(section.tags)).toBe(true);
  expect(section.tags.length).toBeGreaterThan(0);
}

// ──────────────────────────────────────────
// General preset
// ──────────────────────────────────────────
describe('generalPreset', () => {
  it('detect() always returns true', () => {
    expect(generalPreset.detect(makeScan())).toBe(true);
    expect(generalPreset.detect(makeScan({ language: 'typescript' }))).toBe(true);
    expect(generalPreset.detect(makeScan({ language: 'python' }))).toBe(true);
    expect(generalPreset.detect(makeScan({ language: 'go' }))).toBe(true);
  });

  it('sections() returns all expected section IDs', () => {
    const sections = generalPreset.sections(makeScan());
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('code-style');
    expect(ids).toContain('error-handling');
    expect(ids).toContain('security');
    expect(ids).toContain('project-structure');
    expect(ids).toContain('dependencies');
    expect(ids).toContain('testing');
    expect(ids).toContain('git-conventions');
    expect(sections).toHaveLength(7);
  });

  it('all sections have valid required fields', () => {
    const sections = generalPreset.sections(makeScan());
    for (const section of sections) {
      assertValidSection(section);
    }
  });

  it('code-style mentions framework when detected', () => {
    const sections = generalPreset.sections(makeScan({ framework: 'nextjs' }));
    const codeStyle = sections.find((s) => s.id === 'code-style')!;
    expect(codeStyle.content).toContain('nextjs');
  });

  it('project-structure includes detected directories', () => {
    const sections = generalPreset.sections(
      makeScan({ directories: ['src', 'app', 'components'] }),
    );
    const structure = sections.find((s) => s.id === 'project-structure')!;
    expect(structure.content).toContain('src');
    expect(structure.content).toContain('app');
    expect(structure.content).toContain('components');
  });

  it('project-structure mentions monorepo when detected', () => {
    const sections = generalPreset.sections(makeScan({ monorepo: true }));
    const structure = sections.find((s) => s.id === 'project-structure')!;
    expect(structure.content.toLowerCase()).toContain('monorepo');
  });

  it('dependencies mentions package manager when detected', () => {
    const sections = generalPreset.sections(makeScan({ packageManager: 'pnpm' }));
    const deps = sections.find((s) => s.id === 'dependencies')!;
    expect(deps.content).toContain('pnpm');
  });

  it('testing mentions test framework when detected', () => {
    const sections = generalPreset.sections(makeScan({ testing: 'vitest' }));
    const testing = sections.find((s) => s.id === 'testing')!;
    expect(testing.content).toContain('vitest');
  });

  it('security section warns about hardcoded secrets', () => {
    const sections = generalPreset.sections(makeScan());
    const security = sections.find((s) => s.id === 'security')!;
    expect(security.content.toLowerCase()).toContain('secret');
    expect(security.content.toLowerCase()).toContain('api key');
  });

  it('error-handling section warns against empty catch blocks', () => {
    const sections = generalPreset.sections(makeScan());
    const errors = sections.find((s) => s.id === 'error-handling')!;
    expect(errors.content).toContain('catch');
    expect(errors.content.toLowerCase()).toContain('swallow');
  });
});

// ──────────────────────────────────────────
// TypeScript preset
// ──────────────────────────────────────────
describe('typescriptPreset', () => {
  it('detect() returns true for typescript language', () => {
    expect(typescriptPreset.detect(makeScan({ language: 'typescript' }))).toBe(true);
  });

  it('detect() returns false for non-typescript languages', () => {
    expect(typescriptPreset.detect(makeScan({ language: 'python' }))).toBe(false);
    expect(typescriptPreset.detect(makeScan({ language: 'javascript' }))).toBe(false);
    expect(typescriptPreset.detect(makeScan({ language: 'go' }))).toBe(false);
    expect(typescriptPreset.detect(makeScan({ language: 'unknown' }))).toBe(false);
  });

  it('sections() returns all expected section IDs', () => {
    const sections = typescriptPreset.sections(makeScan({ language: 'typescript' }));
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('type-safety');
    expect(ids).toContain('typescript-patterns');
    expect(ids).toContain('typescript-imports');
    expect(ids).toContain('typescript-errors');
    expect(sections).toHaveLength(4);
  });

  it('all sections have valid required fields', () => {
    const sections = typescriptPreset.sections(makeScan({ language: 'typescript' }));
    for (const section of sections) {
      assertValidSection(section);
    }
  });

  it('type-safety section warns against `any`', () => {
    const sections = typescriptPreset.sections(makeScan({ language: 'typescript' }));
    const typeSafety = sections.find((s) => s.id === 'type-safety')!;
    expect(typeSafety.content).toContain('any');
    expect(typeSafety.content).toContain('unknown');
  });

  it('type-safety section warns against @ts-ignore', () => {
    const sections = typescriptPreset.sections(makeScan({ language: 'typescript' }));
    const typeSafety = sections.find((s) => s.id === 'type-safety')!;
    expect(typeSafety.content).toContain('@ts-ignore');
    expect(typeSafety.content).toContain('@ts-expect-error');
  });

  it('typescript-patterns section mentions satisfies operator', () => {
    const sections = typescriptPreset.sections(makeScan({ language: 'typescript' }));
    const patterns = sections.find((s) => s.id === 'typescript-patterns')!;
    expect(patterns.content).toContain('satisfies');
  });

  it('typescript-patterns section mentions nullish coalescing', () => {
    const sections = typescriptPreset.sections(makeScan({ language: 'typescript' }));
    const patterns = sections.find((s) => s.id === 'typescript-patterns')!;
    expect(patterns.content).toContain('??');
  });

  it('typescript-imports section mentions import type', () => {
    const sections = typescriptPreset.sections(makeScan({ language: 'typescript' }));
    const imports = sections.find((s) => s.id === 'typescript-imports')!;
    expect(imports.content).toContain('import type');
  });

  it('typescript-errors section mentions custom error classes', () => {
    const sections = typescriptPreset.sections(makeScan({ language: 'typescript' }));
    const errors = sections.find((s) => s.id === 'typescript-errors')!;
    expect(errors.content).toContain('extends Error');
    expect(errors.content).toContain('unknown');
  });

  it('typescript-errors section mentions Result pattern', () => {
    const sections = typescriptPreset.sections(makeScan({ language: 'typescript' }));
    const errors = sections.find((s) => s.id === 'typescript-errors')!;
    expect(errors.content).toContain('Result');
  });

  it('all sections have typescript-related tags', () => {
    const sections = typescriptPreset.sections(makeScan({ language: 'typescript' }));
    for (const section of sections) {
      const hasRelevantTag = section.tags.some(
        (t) => t === 'typescript' || t === 'types' || t === 'errors' || t === 'imports' || t === 'patterns',
      );
      expect(hasRelevantTag).toBe(true);
    }
  });
});

// ──────────────────────────────────────────
// Preset registry (index.ts)
// ──────────────────────────────────────────
describe('preset registry', () => {
  it('detectPresets returns general for any scan', () => {
    const detected = detectPresets(makeScan());
    const ids = detected.map((p) => p.id);
    expect(ids).toContain('general');
  });

  it('detectPresets returns general + typescript for TS projects', () => {
    const detected = detectPresets(makeScan({ language: 'typescript' }));
    const ids = detected.map((p) => p.id);
    expect(ids).toContain('general');
    expect(ids).toContain('typescript');
  });

  it('detectPresets does not return typescript for Python projects', () => {
    const detected = detectPresets(makeScan({ language: 'python' }));
    const ids = detected.map((p) => p.id);
    expect(ids).toContain('general');
    expect(ids).not.toContain('typescript');
  });

  it('getPreset returns the correct preset by ID', () => {
    expect(getPreset('general')?.id).toBe('general');
    expect(getPreset('typescript')?.id).toBe('typescript');
    expect(getPreset('nonexistent')).toBeUndefined();
  });

  it('getAllPresetIds includes registered presets', () => {
    const ids = getAllPresetIds();
    expect(ids).toContain('general');
    expect(ids).toContain('typescript');
  });
});
