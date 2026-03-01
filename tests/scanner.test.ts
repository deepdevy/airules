import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { scanProject } from '../src/core/scanner.js';

const fixture = (name: string) => resolve(__dirname, 'fixtures', name);

// ──────────────────────────────────────────
// Empty / unknown project
// ──────────────────────────────────────────
describe('scanProject — empty project', () => {
  it('returns safe defaults for an empty directory', async () => {
    const result = await scanProject(fixture('empty-project'));
    expect(result.language).toBe('unknown');
    expect(result.framework).toBeNull();
    expect(result.packageManager).toBeNull();
    expect(result.styling).toBeNull();
    expect(result.testing).toBeNull();
    expect(result.orm).toBeNull();
    expect(result.monorepo).toBe(false);
    expect(result.directories).toEqual([]);
    expect(result.dependencies).toEqual({});
  });

  it('returns safe defaults for a nonexistent path', async () => {
    const result = await scanProject('/completely/nonexistent/path');
    expect(result.language).toBe('unknown');
    expect(result.framework).toBeNull();
    expect(result.packageManager).toBeNull();
    expect(result.monorepo).toBe(false);
    expect(result.directories).toEqual([]);
    expect(result.dependencies).toEqual({});
  });
});

// ──────────────────────────────────────────
// Next.js + TypeScript project
// ──────────────────────────────────────────
describe('scanProject — nextjs-project', () => {
  it('detects TypeScript language', async () => {
    const r = await scanProject(fixture('nextjs-project'));
    expect(r.language).toBe('typescript');
  });

  it('detects Next.js framework', async () => {
    const r = await scanProject(fixture('nextjs-project'));
    expect(r.framework).toBe('nextjs');
  });

  it('detects pnpm package manager from pnpm-lock.yaml', async () => {
    const r = await scanProject(fixture('nextjs-project'));
    expect(r.packageManager).toBe('pnpm');
  });

  it('detects Tailwind styling', async () => {
    const r = await scanProject(fixture('nextjs-project'));
    expect(r.styling).toBe('tailwind');
  });

  it('detects Vitest testing', async () => {
    const r = await scanProject(fixture('nextjs-project'));
    expect(r.testing).toBe('vitest');
  });

  it('detects Prisma ORM', async () => {
    const r = await scanProject(fixture('nextjs-project'));
    expect(r.orm).toBe('prisma');
  });

  it('detects monorepo from turbo.json', async () => {
    const r = await scanProject(fixture('nextjs-project'));
    expect(r.monorepo).toBe(true);
  });

  it('detects existing directories (src, app, components, public)', async () => {
    const r = await scanProject(fixture('nextjs-project'));
    expect(r.directories).toContain('src');
    expect(r.directories).toContain('app');
    expect(r.directories).toContain('components');
    expect(r.directories).toContain('public');
    // should NOT contain dirs that don't exist
    expect(r.directories).not.toContain('pages');
    expect(r.directories).not.toContain('templates');
  });

  it('collects key dependencies with versions', async () => {
    const r = await scanProject(fixture('nextjs-project'));
    expect(r.dependencies).toHaveProperty('next');
    expect(r.dependencies).toHaveProperty('react');
    expect(r.dependencies).toHaveProperty('tailwindcss');
    expect(r.dependencies).toHaveProperty('prisma');
    expect(r.dependencies).toHaveProperty('typescript');
    expect(r.dependencies.next).toBe('^14.0.0');
  });
});

// ──────────────────────────────────────────
// Python / FastAPI project
// ──────────────────────────────────────────
describe('scanProject — python-project', () => {
  it('detects Python language', async () => {
    const r = await scanProject(fixture('python-project'));
    expect(r.language).toBe('python');
  });

  it('detects FastAPI framework', async () => {
    const r = await scanProject(fixture('python-project'));
    expect(r.framework).toBe('fastapi');
  });

  it('detects pip package manager (no lock files)', async () => {
    const r = await scanProject(fixture('python-project'));
    expect(r.packageManager).toBe('pip');
  });

  it('detects pytest testing', async () => {
    const r = await scanProject(fixture('python-project'));
    expect(r.testing).toBe('pytest');
  });

  it('detects SQLAlchemy ORM', async () => {
    const r = await scanProject(fixture('python-project'));
    expect(r.orm).toBe('sqlalchemy');
  });

  it('has null styling (no JS deps)', async () => {
    const r = await scanProject(fixture('python-project'));
    expect(r.styling).toBeNull();
  });

  it('is not a monorepo', async () => {
    const r = await scanProject(fixture('python-project'));
    expect(r.monorepo).toBe(false);
  });

  it('detects existing directories (src, templates)', async () => {
    const r = await scanProject(fixture('python-project'));
    expect(r.directories).toContain('src');
    expect(r.directories).toContain('templates');
  });
});

// ──────────────────────────────────────────
// Go / Gin project
// ──────────────────────────────────────────
describe('scanProject — go-project', () => {
  it('detects Go language', async () => {
    const r = await scanProject(fixture('go-project'));
    expect(r.language).toBe('go');
  });

  it('detects Gin framework', async () => {
    const r = await scanProject(fixture('go-project'));
    expect(r.framework).toBe('gin');
  });

  it('detects go package manager', async () => {
    const r = await scanProject(fixture('go-project'));
    expect(r.packageManager).toBe('go');
  });

  it('detects go-test testing', async () => {
    const r = await scanProject(fixture('go-project'));
    expect(r.testing).toBe('go-test');
  });

  it('has null ORM', async () => {
    const r = await scanProject(fixture('go-project'));
    expect(r.orm).toBeNull();
  });

  it('detects existing directories (api, routes)', async () => {
    const r = await scanProject(fixture('go-project'));
    expect(r.directories).toContain('api');
    expect(r.directories).toContain('routes');
  });
});

// ──────────────────────────────────────────
// Rust / Axum project
// ──────────────────────────────────────────
describe('scanProject — rust-project', () => {
  it('detects Rust language', async () => {
    const r = await scanProject(fixture('rust-project'));
    expect(r.language).toBe('rust');
  });

  it('detects Axum framework', async () => {
    const r = await scanProject(fixture('rust-project'));
    expect(r.framework).toBe('axum');
  });

  it('detects cargo package manager', async () => {
    const r = await scanProject(fixture('rust-project'));
    expect(r.packageManager).toBe('cargo');
  });

  it('detects cargo-test testing', async () => {
    const r = await scanProject(fixture('rust-project'));
    expect(r.testing).toBe('cargo-test');
  });

  it('detects existing directories (src)', async () => {
    const r = await scanProject(fixture('rust-project'));
    expect(r.directories).toContain('src');
  });
});
