import { describe, it, expect } from 'vitest';
import type { RuleSection, ScanResult } from '../src/types.js';
import { GENERATED_HEADER } from '../src/types.js';
import { emitters } from '../src/emitters/index.js';
import { claudeEmitter } from '../src/emitters/claude.js';
import { cursorEmitter } from '../src/emitters/cursor.js';
import { rooEmitter } from '../src/emitters/roo.js';
import { sortSections } from '../src/emitters/markdown.js';

const sampleSections: RuleSection[] = [
  {
    id: 'low-priority',
    title: 'Low Priority Section',
    content: 'Low priority content here.',
    priority: 'low',
    tags: ['misc'],
  },
  {
    id: 'high-priority',
    title: 'High Priority Section',
    content: 'High priority content here.',
    priority: 'high',
    tags: ['important'],
  },
  {
    id: 'medium-priority',
    title: 'Medium Priority Section',
    content: 'Medium priority content here.',
    priority: 'medium',
    tags: ['general'],
  },
  {
    id: 'empty-section',
    title: 'Empty Section',
    content: '   ',
    priority: 'high',
    tags: [],
  },
];

const emptyScan: ScanResult = {
  language: 'typescript',
  framework: null,
  packageManager: 'npm',
  styling: null,
  testing: 'vitest',
  orm: null,
  monorepo: false,
  directories: ['src'],
  dependencies: {},
};

describe('emitters registry', () => {
  it('should have exactly 11 emitters registered', () => {
    expect(emitters).toHaveLength(11);
  });

  it('should have unique ids', () => {
    const ids = emitters.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('claude emitter', () => {
  it('should return exactly 1 EmitResult with correct path', () => {
    const results = claudeEmitter.emit(sampleSections, emptyScan);
    expect(results).toHaveLength(1);
    expect(results[0].path).toBe('CLAUDE.md');
  });

  it('should contain GENERATED_HEADER', () => {
    const results = claudeEmitter.emit(sampleSections, emptyScan);
    expect(results[0].content).toContain(GENERATED_HEADER);
  });

  it('should contain "# Claude Code Rules"', () => {
    const results = claudeEmitter.emit(sampleSections, emptyScan);
    expect(results[0].content).toContain('# Claude Code Rules');
  });
});

describe('cursor emitter', () => {
  it('should return exactly 1 EmitResult with correct path', () => {
    const results = cursorEmitter.emit(sampleSections, emptyScan);
    expect(results).toHaveLength(1);
    expect(results[0].path).toBe('.cursor/rules/airules.mdc');
  });

  it('should start with "---" (YAML frontmatter)', () => {
    const results = cursorEmitter.emit(sampleSections, emptyScan);
    expect(results[0].content.startsWith('---')).toBe(true);
  });

  it('should contain "alwaysApply: true"', () => {
    const results = cursorEmitter.emit(sampleSections, emptyScan);
    expect(results[0].content).toContain('alwaysApply: true');
  });

  it('should contain GENERATED_HEADER', () => {
    const results = cursorEmitter.emit(sampleSections, emptyScan);
    expect(results[0].content).toContain(GENERATED_HEADER);
  });
});

describe('roo emitter', () => {
  it('should return exactly 1 EmitResult with correct path', () => {
    const results = rooEmitter.emit(sampleSections, emptyScan);
    expect(results).toHaveLength(1);
    expect(results[0].path).toBe('.roo/rules/airules.md');
  });

  it('should start with "---" (YAML frontmatter)', () => {
    const results = rooEmitter.emit(sampleSections, emptyScan);
    expect(results[0].content.startsWith('---')).toBe(true);
  });

  it('should contain GENERATED_HEADER', () => {
    const results = rooEmitter.emit(sampleSections, emptyScan);
    expect(results[0].content).toContain(GENERATED_HEADER);
  });
});

describe('all emitters return exactly 1 EmitResult with correct path', () => {
  const expectedPaths: Record<string, string> = {
    claude: 'CLAUDE.md',
    cursor: '.cursor/rules/airules.mdc',
    windsurf: '.windsurfrules',
    copilot: '.github/copilot-instructions.md',
    cline: '.clinerules',
    codex: 'AGENTS.md',
    gemini: 'GEMINI.md',
    aider: 'CONVENTIONS.md',
    zed: '.rules',
    roo: '.roo/rules/airules.md',
    amazonq: '.amazonq/rules/airules.md',
  };

  for (const emitter of emitters) {
    it(`${emitter.id} emitter returns 1 result with path "${expectedPaths[emitter.id]}"`, () => {
      const results = emitter.emit(sampleSections, emptyScan);
      expect(results).toHaveLength(1);
      expect(results[0].path).toBe(expectedPaths[emitter.id]);
    });
  }
});

describe('priority sorting', () => {
  it('should sort sections by priority: high > medium > low', () => {
    const sorted = sortSections(sampleSections);
    expect(sorted[0].priority).toBe('high');
    expect(sorted[1].priority).toBe('medium');
    expect(sorted[2].priority).toBe('low');
  });

  it('should filter out empty content sections', () => {
    const sorted = sortSections(sampleSections);
    expect(sorted).toHaveLength(3);
    expect(sorted.find((s) => s.id === 'empty-section')).toBeUndefined();
  });

  it('should reflect priority order in emitter output', () => {
    const results = claudeEmitter.emit(sampleSections, emptyScan);
    const content = results[0].content;
    const highIdx = content.indexOf('## High Priority Section');
    const medIdx = content.indexOf('## Medium Priority Section');
    const lowIdx = content.indexOf('## Low Priority Section');
    expect(highIdx).toBeLessThan(medIdx);
    expect(medIdx).toBeLessThan(lowIdx);
  });
});
