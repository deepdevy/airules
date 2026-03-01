import { readFile, access, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { ScanResult } from '../types.js';

// === Helpers ===

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readTextFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

async function readJsonFile(filePath: string): Promise<Record<string, unknown> | null> {
  const text = await readTextFile(filePath);
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: unknown;
}

async function readPackageJson(projectRoot: string): Promise<PackageJson | null> {
  return await readJsonFile(join(projectRoot, 'package.json')) as PackageJson | null;
}

function hasDep(pkg: PackageJson | null, name: string): boolean {
  if (!pkg) return false;
  return !!(pkg.dependencies?.[name] || pkg.devDependencies?.[name]);
}

function getDepVersion(pkg: PackageJson | null, name: string): string | undefined {
  if (!pkg) return undefined;
  return pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];
}

// === Detection Functions ===

async function detectLanguage(
  projectRoot: string,
  pkg: PackageJson | null,
): Promise<ScanResult['language']> {
  if (await fileExists(join(projectRoot, 'tsconfig.json'))) return 'typescript';
  if (await fileExists(join(projectRoot, 'go.mod'))) return 'go';
  if (await fileExists(join(projectRoot, 'Cargo.toml'))) return 'rust';
  if (
    (await fileExists(join(projectRoot, 'requirements.txt'))) ||
    (await fileExists(join(projectRoot, 'pyproject.toml')))
  )
    return 'python';
  if (await fileExists(join(projectRoot, 'Gemfile'))) return 'ruby';
  if (
    (await fileExists(join(projectRoot, 'pom.xml'))) ||
    (await fileExists(join(projectRoot, 'build.gradle')))
  )
    return 'java';
  if (pkg) return 'javascript';
  return 'unknown';
}

async function detectFramework(
  projectRoot: string,
  pkg: PackageJson | null,
  language: ScanResult['language'],
): Promise<string | null> {
  // Node.js frameworks (from package.json dependencies)
  if (pkg) {
    if (hasDep(pkg, 'next')) return 'nextjs';
    if (hasDep(pkg, 'react')) return 'react';
    if (hasDep(pkg, 'vue')) return 'vue';
    if (hasDep(pkg, 'express')) return 'express';
  }

  // Python frameworks
  if (language === 'python') {
    const reqTxt = await readTextFile(join(projectRoot, 'requirements.txt'));
    const pyproject = await readTextFile(join(projectRoot, 'pyproject.toml'));
    const combined = (reqTxt ?? '') + '\n' + (pyproject ?? '');
    if (combined.includes('fastapi')) return 'fastapi';
    if (combined.includes('django')) return 'django';
  }

  // Go frameworks
  if (language === 'go') {
    const goMod = await readTextFile(join(projectRoot, 'go.mod'));
    if (goMod?.includes('gin-gonic/gin')) return 'gin';
  }

  // Rust frameworks
  if (language === 'rust') {
    const cargoToml = await readTextFile(join(projectRoot, 'Cargo.toml'));
    if (cargoToml?.includes('actix-web')) return 'actix';
    if (cargoToml?.includes('axum')) return 'axum';
  }

  return null;
}

async function detectPackageManager(
  projectRoot: string,
  language: ScanResult['language'],
): Promise<string | null> {
  // Node.js lock files
  if (language === 'typescript' || language === 'javascript') {
    if (await fileExists(join(projectRoot, 'pnpm-lock.yaml'))) return 'pnpm';
    if (await fileExists(join(projectRoot, 'yarn.lock'))) return 'yarn';
    if (
      (await fileExists(join(projectRoot, 'bun.lockb'))) ||
      (await fileExists(join(projectRoot, 'bun.lock')))
    )
      return 'bun';
    if (await fileExists(join(projectRoot, 'package-lock.json'))) return 'npm';
    // Has package.json but no lockfile — default npm
    if (await fileExists(join(projectRoot, 'package.json'))) return 'npm';
    return null;
  }

  // Python package managers
  if (language === 'python') {
    if (await fileExists(join(projectRoot, 'poetry.lock'))) return 'poetry';
    if (await fileExists(join(projectRoot, 'Pipfile.lock'))) return 'pipenv';
    if (await fileExists(join(projectRoot, 'uv.lock'))) return 'uv';
    return 'pip';
  }

  if (language === 'go') return 'go';
  if (language === 'rust') return 'cargo';

  return null;
}

function detectStyling(pkg: PackageJson | null): string | null {
  if (!pkg) return null;
  if (hasDep(pkg, 'tailwindcss')) return 'tailwind';
  if (hasDep(pkg, 'styled-components')) return 'styled-components';
  if (hasDep(pkg, '@emotion/react')) return 'emotion';
  // css-modules detection: if postcss is present it's a good proxy
  if (hasDep(pkg, 'postcss')) return 'css-modules';
  return null;
}

async function detectTesting(
  projectRoot: string,
  pkg: PackageJson | null,
  language: ScanResult['language'],
): Promise<string | null> {
  // Node.js testing
  if (pkg) {
    if (hasDep(pkg, 'vitest')) return 'vitest';
    if (hasDep(pkg, 'jest')) return 'jest';
    if (hasDep(pkg, 'mocha')) return 'mocha';
  }

  // Python testing
  if (language === 'python') {
    const reqTxt = await readTextFile(join(projectRoot, 'requirements.txt'));
    const pyproject = await readTextFile(join(projectRoot, 'pyproject.toml'));
    const combined = (reqTxt ?? '') + '\n' + (pyproject ?? '');
    if (combined.includes('pytest')) return 'pytest';
  }

  // Go / Rust built-in test tooling
  if (language === 'go') return 'go-test';
  if (language === 'rust') return 'cargo-test';

  return null;
}

async function detectOrm(
  projectRoot: string,
  pkg: PackageJson | null,
  language: ScanResult['language'],
): Promise<string | null> {
  if (pkg) {
    if (hasDep(pkg, 'prisma') || hasDep(pkg, '@prisma/client')) return 'prisma';
    if (hasDep(pkg, 'drizzle-orm')) return 'drizzle';
    if (hasDep(pkg, 'typeorm')) return 'typeorm';
    if (hasDep(pkg, 'sequelize')) return 'sequelize';
  }

  if (language === 'python') {
    const reqTxt = await readTextFile(join(projectRoot, 'requirements.txt'));
    const pyproject = await readTextFile(join(projectRoot, 'pyproject.toml'));
    const combined = (reqTxt ?? '') + '\n' + (pyproject ?? '');
    if (combined.includes('sqlalchemy')) return 'sqlalchemy';
  }

  return null;
}

async function detectMonorepo(
  projectRoot: string,
  pkg: PackageJson | null,
): Promise<boolean> {
  if (pkg?.workspaces) return true;
  if (await fileExists(join(projectRoot, 'nx.json'))) return true;
  if (await fileExists(join(projectRoot, 'turbo.json'))) return true;
  if (await fileExists(join(projectRoot, 'pnpm-workspace.yaml'))) return true;
  return false;
}

const KNOWN_DIRS = [
  'src',
  'app',
  'pages',
  'components',
  'lib',
  'utils',
  'api',
  'routes',
  'public',
  'static',
  'templates',
];

async function detectDirectories(projectRoot: string): Promise<string[]> {
  const found: string[] = [];
  for (const dir of KNOWN_DIRS) {
    try {
      const entries = await readdir(join(projectRoot, dir), { withFileTypes: true });
      // Only count it if it's actually a directory (readdir succeeded is sufficient)
      if (entries !== undefined) found.push(dir);
    } catch {
      // doesn't exist or not a directory — skip
    }
  }
  return found;
}

/** Collect key dependencies (only the ones we care about for detection). */
function collectDependencies(pkg: PackageJson | null): Record<string, string> {
  if (!pkg) return {};
  const keys = [
    // frameworks
    'next', 'react', 'vue', 'express',
    // styling
    'tailwindcss', 'styled-components', '@emotion/react', 'postcss',
    // testing
    'vitest', 'jest', 'mocha',
    // orm
    'prisma', '@prisma/client', 'drizzle-orm', 'typeorm', 'sequelize',
    // runtime
    'typescript',
  ];

  const deps: Record<string, string> = {};
  for (const key of keys) {
    const version = getDepVersion(pkg, key);
    if (version) deps[key] = version;
  }
  return deps;
}

// === Main Scanner ===

/**
 * Scans a project directory to detect the tech stack.
 * Reads package.json, tsconfig.json, go.mod, Cargo.toml, etc.
 * Returns a ScanResult with detected language, framework, dependencies, etc.
 */
export async function scanProject(projectRoot: string): Promise<ScanResult> {
  const pkg = await readPackageJson(projectRoot);
  const language = await detectLanguage(projectRoot, pkg);
  const [framework, packageManager, testing, orm, monorepo, directories] =
    await Promise.all([
      detectFramework(projectRoot, pkg, language),
      detectPackageManager(projectRoot, language),
      detectTesting(projectRoot, pkg, language),
      detectOrm(projectRoot, pkg, language),
      detectMonorepo(projectRoot, pkg),
      detectDirectories(projectRoot),
    ]);

  const styling = detectStyling(pkg);
  const dependencies = collectDependencies(pkg);

  return {
    language,
    framework,
    packageManager,
    styling,
    testing,
    orm,
    monorepo,
    directories,
    dependencies,
  };
}
