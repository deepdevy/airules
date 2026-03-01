import { describe, it, expect } from 'vitest';
import { generate, listPresets, listTools } from '../src/core/engine.js';

describe('engine', () => {
  describe('generate', () => {
    it('should return a GenerateResult for a Next.js fixture project', async () => {
      const result = await generate({
        projectRoot: 'tests/fixtures/nextjs-project',
      });

      expect(result.scan).toBeDefined();
      expect(result.scan.language).toBe('typescript');
      expect(result.scan.framework).toBe('nextjs');
      expect(result.emitResults).toBeDefined();
      expect(result.matchedPresets.length).toBeGreaterThan(0);
      expect(result.targetTools.length).toBeGreaterThan(0);
    });

    it('should generate EmitResults for all registered tools', async () => {
      const result = await generate({
        projectRoot: 'tests/fixtures/nextjs-project',
      });

      // Should have emit results (deduplicated by path — codex and opencode share AGENTS.md)
      expect(result.emitResults.length).toBeGreaterThanOrEqual(listTools().length - 1);

      // Each emit result should have path and content
      for (const emit of result.emitResults) {
        expect(emit.path).toBeTruthy();
        expect(emit.content).toBeTruthy();
      }
    });

    it('should respect tools filter', async () => {
      const result = await generate({
        projectRoot: 'tests/fixtures/nextjs-project',
        tools: ['claude', 'cursor'],
      });

      expect(result.targetTools).toEqual(['claude', 'cursor']);
      expect(result.emitResults.length).toBe(2);

      const paths = result.emitResults.map((e) => e.path);
      expect(paths).toContain('CLAUDE.md');
      expect(paths).toContain('.cursor/rules/airules.mdc');
    });

    it('should handle empty project gracefully', async () => {
      const result = await generate({
        projectRoot: 'tests/fixtures/empty-project',
      });

      expect(result.scan.language).toBe('unknown');
      expect(result.scan.framework).toBeNull();
      // Should still generate files (with general preset at minimum)
      expect(result.emitResults).toBeDefined();
    });

    it('should handle Python project', async () => {
      const result = await generate({
        projectRoot: 'tests/fixtures/python-project',
      });

      expect(result.scan.language).toBe('python');
      expect(result.scan.framework).toBe('fastapi');
    });

    it('should handle Go project', async () => {
      const result = await generate({
        projectRoot: 'tests/fixtures/go-project',
      });

      expect(result.scan.language).toBe('go');
    });

    it('should use config overrides when provided', async () => {
      const result = await generate({
        projectRoot: 'tests/fixtures/nextjs-project',
        config: {
          tools: ['claude'],
          presets: ['general'],
          exclude: ['typescript'],
        },
      });

      expect(result.targetTools).toEqual(['claude']);
      expect(result.emitResults.length).toBe(1);
      expect(result.emitResults[0].path).toBe('CLAUDE.md');
    });
  });

  describe('listPresets', () => {
    it('should return an array of preset IDs', () => {
      const presets = listPresets();
      expect(presets).toBeDefined();
      expect(Array.isArray(presets)).toBe(true);
    });
  });

  describe('listTools', () => {
    it('should return 12 tool IDs', () => {
      const tools = listTools();
      expect(tools).toHaveLength(12);
      expect(tools).toContain('claude');
      expect(tools).toContain('cursor');
      expect(tools).toContain('copilot');
      expect(tools).toContain('opencode');
    });
  });
});
