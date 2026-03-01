import { describe, it, expect } from 'vitest';
import type { ScanResult, RuleSection } from '../src/types.js';
import { nextjsPreset } from '../src/presets/nextjs.js';
import { reactPreset } from '../src/presets/react.js';
import { vuePreset } from '../src/presets/vue.js';
import { expressPreset } from '../src/presets/express.js';
import { fastapiPreset } from '../src/presets/fastapi.js';
import { djangoPreset } from '../src/presets/django.js';
import { goPreset } from '../src/presets/go.js';
import { rustPreset } from '../src/presets/rust.js';

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
  expect(section.content.length).toBeGreaterThan(100);
  expect(['high', 'medium', 'low']).toContain(section.priority);
  expect(Array.isArray(section.tags)).toBe(true);
  expect(section.tags.length).toBeGreaterThan(0);
}

// ──────────────────────────────────────────
// Next.js preset
// ──────────────────────────────────────────
describe('nextjsPreset', () => {
  it('detect() returns true when framework is nextjs', () => {
    expect(nextjsPreset.detect(makeScan({ framework: 'nextjs' }))).toBe(true);
  });

  it('detect() returns false for non-nextjs frameworks', () => {
    expect(nextjsPreset.detect(makeScan())).toBe(false);
    expect(nextjsPreset.detect(makeScan({ framework: 'react' }))).toBe(false);
    expect(nextjsPreset.detect(makeScan({ framework: 'vue' }))).toBe(false);
  });

  it('sections() returns non-empty array', () => {
    const sections = nextjsPreset.sections(makeScan({ framework: 'nextjs' }));
    expect(sections.length).toBeGreaterThan(0);
  });

  it('sections() returns all expected section IDs', () => {
    const sections = nextjsPreset.sections(makeScan({ framework: 'nextjs' }));
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('nextjs-app-router');
    expect(ids).toContain('nextjs-data-fetching');
    expect(ids).toContain('nextjs-routing');
    expect(ids).toContain('nextjs-performance');
    expect(sections).toHaveLength(4);
  });

  it('all sections have valid required fields', () => {
    const sections = nextjsPreset.sections(makeScan({ framework: 'nextjs' }));
    for (const section of sections) {
      assertValidSection(section);
    }
  });

  it('app-router section mentions Server Components and use client', () => {
    const sections = nextjsPreset.sections(makeScan({ framework: 'nextjs' }));
    const appRouter = sections.find((s) => s.id === 'nextjs-app-router')!;
    expect(appRouter.content).toContain('Server Component');
    expect(appRouter.content).toContain("'use client'");
    expect(appRouter.content).toContain('page.tsx');
    expect(appRouter.content).toContain('layout.tsx');
  });

  it('data-fetching section covers server actions and fetch revalidation', () => {
    const sections = nextjsPreset.sections(makeScan({ framework: 'nextjs' }));
    const dataFetching = sections.find((s) => s.id === 'nextjs-data-fetching')!;
    expect(dataFetching.content).toContain('Server Action');
    expect(dataFetching.content).toContain('revalidat');
  });

  it('performance section mentions next/image and next/font', () => {
    const sections = nextjsPreset.sections(makeScan({ framework: 'nextjs' }));
    const perf = sections.find((s) => s.id === 'nextjs-performance')!;
    expect(perf.content).toContain('next/image');
    expect(perf.content).toContain('next/font');
  });
});

// ──────────────────────────────────────────
// React preset
// ──────────────────────────────────────────
describe('reactPreset', () => {
  it('detect() returns true when framework is react', () => {
    expect(reactPreset.detect(makeScan({ framework: 'react' }))).toBe(true);
  });

  it('detect() returns true when react is in dependencies', () => {
    expect(reactPreset.detect(makeScan({ dependencies: { react: '18.2.0' } }))).toBe(true);
  });

  it('detect() returns false for non-react projects', () => {
    expect(reactPreset.detect(makeScan())).toBe(false);
    expect(reactPreset.detect(makeScan({ framework: 'vue' }))).toBe(false);
    expect(reactPreset.detect(makeScan({ dependencies: { vue: '3.0.0' } }))).toBe(false);
  });

  it('sections() returns non-empty array', () => {
    const sections = reactPreset.sections(makeScan({ framework: 'react' }));
    expect(sections.length).toBeGreaterThan(0);
  });

  it('sections() returns all expected section IDs', () => {
    const sections = reactPreset.sections(makeScan({ framework: 'react' }));
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('react-components');
    expect(ids).toContain('react-hooks');
    expect(ids).toContain('react-state');
    expect(ids).toContain('react-patterns');
    expect(sections).toHaveLength(4);
  });

  it('all sections have valid required fields', () => {
    const sections = reactPreset.sections(makeScan({ framework: 'react' }));
    for (const section of sections) {
      assertValidSection(section);
    }
  });

  it('components section covers functional components and composition', () => {
    const sections = reactPreset.sections(makeScan({ framework: 'react' }));
    const comp = sections.find((s) => s.id === 'react-components')!;
    expect(comp.content).toContain('functional component');
    expect(comp.content).toContain('composition');
  });

  it('hooks section covers Rules of Hooks and custom hooks', () => {
    const sections = reactPreset.sections(makeScan({ framework: 'react' }));
    const hooks = sections.find((s) => s.id === 'react-hooks')!;
    expect(hooks.content).toContain('Rules of Hooks');
    expect(hooks.content).toContain('custom hook');
    expect(hooks.content).toContain('useCallback');
    expect(hooks.content).toContain('useMemo');
  });

  it('state section covers lifting state and context', () => {
    const sections = reactPreset.sections(makeScan({ framework: 'react' }));
    const state = sections.find((s) => s.id === 'react-state')!;
    expect(state.content).toContain('Lift state');
    expect(state.content).toContain('Context');
    expect(state.content).toContain('prop drilling');
  });

  it('patterns section covers Error Boundaries and Suspense', () => {
    const sections = reactPreset.sections(makeScan({ framework: 'react' }));
    const patterns = sections.find((s) => s.id === 'react-patterns')!;
    expect(patterns.content).toContain('Error Boundar');
    expect(patterns.content).toContain('Suspense');
  });
});

// ──────────────────────────────────────────
// Vue preset
// ──────────────────────────────────────────
describe('vuePreset', () => {
  it('detect() returns true when framework is vue', () => {
    expect(vuePreset.detect(makeScan({ framework: 'vue' }))).toBe(true);
  });

  it('detect() returns true when vue is in dependencies', () => {
    expect(vuePreset.detect(makeScan({ dependencies: { vue: '3.3.0' } }))).toBe(true);
  });

  it('detect() returns false for non-vue projects', () => {
    expect(vuePreset.detect(makeScan())).toBe(false);
    expect(vuePreset.detect(makeScan({ framework: 'react' }))).toBe(false);
  });

  it('sections() returns non-empty array', () => {
    const sections = vuePreset.sections(makeScan({ framework: 'vue' }));
    expect(sections.length).toBeGreaterThan(0);
  });

  it('sections() returns all expected section IDs', () => {
    const sections = vuePreset.sections(makeScan({ framework: 'vue' }));
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('vue-composition');
    expect(ids).toContain('vue-components');
    expect(ids).toContain('vue-patterns');
    expect(sections).toHaveLength(3);
  });

  it('all sections have valid required fields', () => {
    const sections = vuePreset.sections(makeScan({ framework: 'vue' }));
    for (const section of sections) {
      assertValidSection(section);
    }
  });

  it('composition section covers ref, reactive, and computed', () => {
    const sections = vuePreset.sections(makeScan({ framework: 'vue' }));
    const comp = sections.find((s) => s.id === 'vue-composition')!;
    expect(comp.content).toContain('ref()');
    expect(comp.content).toContain('reactive()');
    expect(comp.content).toContain('computed()');
    expect(comp.content).toContain('script setup');
  });

  it('components section covers defineProps and defineEmits', () => {
    const sections = vuePreset.sections(makeScan({ framework: 'vue' }));
    const comp = sections.find((s) => s.id === 'vue-components')!;
    expect(comp.content).toContain('defineProps');
    expect(comp.content).toContain('defineEmits');
    expect(comp.content).toContain('scoped');
  });

  it('patterns section covers composables and provide/inject', () => {
    const sections = vuePreset.sections(makeScan({ framework: 'vue' }));
    const patterns = sections.find((s) => s.id === 'vue-patterns')!;
    expect(patterns.content).toContain('composable');
    expect(patterns.content).toContain('provide');
    expect(patterns.content).toContain('inject');
    expect(patterns.content).toContain('Teleport');
  });
});

// ──────────────────────────────────────────
// Express preset
// ──────────────────────────────────────────
describe('expressPreset', () => {
  it('detect() returns true when framework is express', () => {
    expect(expressPreset.detect(makeScan({ framework: 'express' }))).toBe(true);
  });

  it('detect() returns true when express is in dependencies', () => {
    expect(expressPreset.detect(makeScan({ dependencies: { express: '4.18.0' } }))).toBe(true);
  });

  it('detect() returns false for non-express projects', () => {
    expect(expressPreset.detect(makeScan())).toBe(false);
    expect(expressPreset.detect(makeScan({ framework: 'fastapi' }))).toBe(false);
  });

  it('sections() returns non-empty array', () => {
    const sections = expressPreset.sections(makeScan({ framework: 'express' }));
    expect(sections.length).toBeGreaterThan(0);
  });

  it('sections() returns all expected section IDs', () => {
    const sections = expressPreset.sections(makeScan({ framework: 'express' }));
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('express-structure');
    expect(ids).toContain('express-middleware');
    expect(ids).toContain('express-security');
    expect(sections).toHaveLength(3);
  });

  it('all sections have valid required fields', () => {
    const sections = expressPreset.sections(makeScan({ framework: 'express' }));
    for (const section of sections) {
      assertValidSection(section);
    }
  });

  it('structure section covers controller pattern and Router', () => {
    const sections = expressPreset.sections(makeScan({ framework: 'express' }));
    const structure = sections.find((s) => s.id === 'express-structure')!;
    expect(structure.content).toContain('Router');
    expect(structure.content).toContain('Controller');
    expect(structure.content).toContain('Service');
  });

  it('middleware section covers ordering and async handler', () => {
    const sections = expressPreset.sections(makeScan({ framework: 'express' }));
    const middleware = sections.find((s) => s.id === 'express-middleware')!;
    expect(middleware.content).toContain('helmet');
    expect(middleware.content).toContain('cors');
    expect(middleware.content).toContain('async');
  });

  it('security section covers helmet and rate limiting', () => {
    const sections = expressPreset.sections(makeScan({ framework: 'express' }));
    const security = sections.find((s) => s.id === 'express-security')!;
    expect(security.content).toContain('helmet');
    expect(security.content).toContain('rate limit');
    expect(security.content).toContain('CORS');
  });
});

// ──────────────────────────────────────────
// FastAPI preset
// ──────────────────────────────────────────
describe('fastapiPreset', () => {
  it('detect() returns true when framework is fastapi', () => {
    expect(fastapiPreset.detect(makeScan({ framework: 'fastapi' }))).toBe(true);
  });

  it('detect() returns false for non-fastapi frameworks', () => {
    expect(fastapiPreset.detect(makeScan())).toBe(false);
    expect(fastapiPreset.detect(makeScan({ framework: 'django' }))).toBe(false);
    expect(fastapiPreset.detect(makeScan({ framework: 'express' }))).toBe(false);
  });

  it('sections() returns non-empty array', () => {
    const sections = fastapiPreset.sections(makeScan({ framework: 'fastapi' }));
    expect(sections.length).toBeGreaterThan(0);
  });

  it('sections() returns all expected section IDs', () => {
    const sections = fastapiPreset.sections(makeScan({ framework: 'fastapi' }));
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('fastapi-structure');
    expect(ids).toContain('fastapi-patterns');
    expect(ids).toContain('fastapi-security');
    expect(sections).toHaveLength(3);
  });

  it('all sections have valid required fields', () => {
    const sections = fastapiPreset.sections(makeScan({ framework: 'fastapi' }));
    for (const section of sections) {
      assertValidSection(section);
    }
  });

  it('structure section covers Pydantic models and APIRouter', () => {
    const sections = fastapiPreset.sections(makeScan({ framework: 'fastapi' }));
    const structure = sections.find((s) => s.id === 'fastapi-structure')!;
    expect(structure.content).toContain('Pydantic');
    expect(structure.content).toContain('APIRouter');
    expect(structure.content).toContain('Depends');
  });

  it('patterns section covers type hints and BackgroundTasks', () => {
    const sections = fastapiPreset.sections(makeScan({ framework: 'fastapi' }));
    const patterns = sections.find((s) => s.id === 'fastapi-patterns')!;
    expect(patterns.content).toContain('type hint');
    expect(patterns.content).toContain('BackgroundTask');
    expect(patterns.content).toContain('Pydantic model');
  });

  it('security section covers OAuth2, JWT, and CORS', () => {
    const sections = fastapiPreset.sections(makeScan({ framework: 'fastapi' }));
    const security = sections.find((s) => s.id === 'fastapi-security')!;
    expect(security.content).toContain('OAuth2');
    expect(security.content).toContain('JWT');
    expect(security.content).toContain('CORS');
  });
});

// ──────────────────────────────────────────
// Django preset
// ──────────────────────────────────────────
describe('djangoPreset', () => {
  it('detect() returns true when framework is django', () => {
    expect(djangoPreset.detect(makeScan({ framework: 'django' }))).toBe(true);
  });

  it('detect() returns false for non-django frameworks', () => {
    expect(djangoPreset.detect(makeScan())).toBe(false);
    expect(djangoPreset.detect(makeScan({ framework: 'fastapi' }))).toBe(false);
    expect(djangoPreset.detect(makeScan({ framework: 'express' }))).toBe(false);
  });

  it('sections() returns non-empty array', () => {
    const sections = djangoPreset.sections(makeScan({ framework: 'django' }));
    expect(sections.length).toBeGreaterThan(0);
  });

  it('sections() returns all expected section IDs', () => {
    const sections = djangoPreset.sections(makeScan({ framework: 'django' }));
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('django-structure');
    expect(ids).toContain('django-patterns');
    expect(ids).toContain('django-security');
    expect(sections).toHaveLength(3);
  });

  it('all sections have valid required fields', () => {
    const sections = djangoPreset.sections(makeScan({ framework: 'django' }));
    for (const section of sections) {
      assertValidSection(section);
    }
  });

  it('structure section covers fat models and select_related', () => {
    const sections = djangoPreset.sections(makeScan({ framework: 'django' }));
    const structure = sections.find((s) => s.id === 'django-structure')!;
    expect(structure.content).toContain('fat models');
    expect(structure.content).toContain('select_related');
    expect(structure.content).toContain('prefetch_related');
  });

  it('patterns section covers CBVs and Django forms', () => {
    const sections = djangoPreset.sections(makeScan({ framework: 'django' }));
    const patterns = sections.find((s) => s.id === 'django-patterns')!;
    expect(patterns.content).toContain('Class-Based View');
    expect(patterns.content).toContain('Form');
    expect(patterns.content).toContain('middleware');
  });

  it('security section covers CSRF and login_required', () => {
    const sections = djangoPreset.sections(makeScan({ framework: 'django' }));
    const security = sections.find((s) => s.id === 'django-security')!;
    expect(security.content).toContain('CSRF');
    expect(security.content).toContain('login_required');
    expect(security.content).toContain('LoginRequiredMixin');
    expect(security.content).toContain('raw SQL');
  });
});

// ──────────────────────────────────────────
// Go preset
// ──────────────────────────────────────────
describe('goPreset', () => {
  it('detect() returns true when language is go', () => {
    expect(goPreset.detect(makeScan({ language: 'go' }))).toBe(true);
  });

  it('detect() returns false for non-go languages', () => {
    expect(goPreset.detect(makeScan())).toBe(false);
    expect(goPreset.detect(makeScan({ language: 'rust' }))).toBe(false);
    expect(goPreset.detect(makeScan({ language: 'typescript' }))).toBe(false);
  });

  it('sections() returns non-empty array', () => {
    const sections = goPreset.sections(makeScan({ language: 'go' }));
    expect(sections.length).toBeGreaterThan(0);
  });

  it('sections() returns all expected section IDs', () => {
    const sections = goPreset.sections(makeScan({ language: 'go' }));
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('go-conventions');
    expect(ids).toContain('go-patterns');
    expect(ids).toContain('go-structure');
    expect(sections).toHaveLength(3);
  });

  it('all sections have valid required fields', () => {
    const sections = goPreset.sections(makeScan({ language: 'go' }));
    for (const section of sections) {
      assertValidSection(section);
    }
  });

  it('conventions section covers error handling and naming', () => {
    const sections = goPreset.sections(makeScan({ language: 'go' }));
    const conventions = sections.find((s) => s.id === 'go-conventions')!;
    expect(conventions.content).toContain('err != nil');
    expect(conventions.content).toContain('PascalCase');
    expect(conventions.content).toContain('camelCase');
    expect(conventions.content).toContain('panic');
  });

  it('patterns section covers interfaces, table-driven tests, and context', () => {
    const sections = goPreset.sections(makeScan({ language: 'go' }));
    const patterns = sections.find((s) => s.id === 'go-patterns')!;
    expect(patterns.content).toContain('Accept interfaces');
    expect(patterns.content).toContain('return struct');
    expect(patterns.content).toContain('table-driven');
    expect(patterns.content).toContain('context');
  });

  it('structure section covers cmd/, internal/, and pkg/', () => {
    const sections = goPreset.sections(makeScan({ language: 'go' }));
    const structure = sections.find((s) => s.id === 'go-structure')!;
    expect(structure.content).toContain('cmd/');
    expect(structure.content).toContain('internal/');
    expect(structure.content).toContain('pkg/');
  });
});

// ──────────────────────────────────────────
// Rust preset
// ──────────────────────────────────────────
describe('rustPreset', () => {
  it('detect() returns true when language is rust', () => {
    expect(rustPreset.detect(makeScan({ language: 'rust' }))).toBe(true);
  });

  it('detect() returns false for non-rust languages', () => {
    expect(rustPreset.detect(makeScan())).toBe(false);
    expect(rustPreset.detect(makeScan({ language: 'go' }))).toBe(false);
    expect(rustPreset.detect(makeScan({ language: 'typescript' }))).toBe(false);
  });

  it('sections() returns non-empty array', () => {
    const sections = rustPreset.sections(makeScan({ language: 'rust' }));
    expect(sections.length).toBeGreaterThan(0);
  });

  it('sections() returns all expected section IDs', () => {
    const sections = rustPreset.sections(makeScan({ language: 'rust' }));
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('rust-ownership');
    expect(ids).toContain('rust-errors');
    expect(ids).toContain('rust-patterns');
    expect(sections).toHaveLength(3);
  });

  it('all sections have valid required fields', () => {
    const sections = rustPreset.sections(makeScan({ language: 'rust' }));
    for (const section of sections) {
      assertValidSection(section);
    }
  });

  it('ownership section covers borrowing, &str, and impl Trait', () => {
    const sections = rustPreset.sections(makeScan({ language: 'rust' }));
    const ownership = sections.find((s) => s.id === 'rust-ownership')!;
    expect(ownership.content).toContain('borrowing');
    expect(ownership.content).toContain('&str');
    expect(ownership.content).toContain('impl Trait');
    expect(ownership.content).toContain('cloning');
  });

  it('errors section covers thiserror, anyhow, and unwrap', () => {
    const sections = rustPreset.sections(makeScan({ language: 'rust' }));
    const errors = sections.find((s) => s.id === 'rust-errors')!;
    expect(errors.content).toContain('thiserror');
    expect(errors.content).toContain('anyhow');
    expect(errors.content).toContain('unwrap()');
    expect(errors.content).toContain('?');
  });

  it('patterns section covers Builder, Newtype, enum, and trait', () => {
    const sections = rustPreset.sections(makeScan({ language: 'rust' }));
    const patterns = sections.find((s) => s.id === 'rust-patterns')!;
    expect(patterns.content).toContain('Builder pattern');
    expect(patterns.content).toContain('Newtype pattern');
    expect(patterns.content).toContain('enum');
    expect(patterns.content).toContain('trait');
  });
});

// ──────────────────────────────────────────
// Cross-cutting: unique IDs across all presets
// ──────────────────────────────────────────
describe('cross-preset validation', () => {
  it('all section IDs are unique across all presets', () => {
    const allPresets = [
      nextjsPreset,
      reactPreset,
      vuePreset,
      expressPreset,
      fastapiPreset,
      djangoPreset,
      goPreset,
      rustPreset,
    ];

    const allIds: string[] = [];
    for (const preset of allPresets) {
      const scan = makeScan({
        language: preset.id === 'go' ? 'go' : preset.id === 'rust' ? 'rust' : 'typescript',
        framework: ['go', 'rust'].includes(preset.id) ? null : preset.id,
        dependencies: preset.id === 'react' ? { react: '18.0.0' } : {},
      });
      const sections = preset.sections(scan);
      for (const section of sections) {
        allIds.push(section.id);
      }
    }

    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('all preset IDs are unique', () => {
    const presets = [
      nextjsPreset,
      reactPreset,
      vuePreset,
      expressPreset,
      fastapiPreset,
      djangoPreset,
      goPreset,
      rustPreset,
    ];
    const ids = presets.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
