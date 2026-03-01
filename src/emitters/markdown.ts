import type { ToolEmitter, RuleSection, ScanResult, EmitResult } from '../types.js';
import { GENERATED_HEADER } from '../types.js';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function sortSections(sections: RuleSection[]): RuleSection[] {
  return sections
    .filter((s) => s.content.trim().length > 0)
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2));
}

export function sectionsToMarkdown(sections: RuleSection[], title: string): string {
  const sorted = sortSections(sections);
  const parts: string[] = [GENERATED_HEADER, `# ${title}`, ''];

  for (const section of sorted) {
    parts.push(`## ${section.title}`, '', section.content.trim(), '');
  }

  return parts.join('\n');
}

export function createMarkdownEmitter(id: string, name: string, outputPath: string): ToolEmitter {
  return {
    id,
    name,
    outputPath,
    emit(sections: RuleSection[], _scan: ScanResult): EmitResult[] {
      const content = sectionsToMarkdown(sections, `${name} Rules`);
      return [{ path: outputPath, content }];
    },
  };
}
