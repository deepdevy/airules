import type { ScanResult, RuleSection, EmitResult, AirulesConfig } from '../types.js';
import { scanProject } from './scanner.js';
import { loadConfig, saveConfig } from './config.js';
import { detectPresets, getPreset, getAllPresetIds } from '../presets/index.js';
import { emitters, getEmitter, getAllEmitterIds } from '../emitters/index.js';

export interface GenerateOptions {
  /** Project root directory */
  projectRoot: string;
  /** Override config (skip loading from file) */
  config?: AirulesConfig;
  /** Only generate for these tools (default: all) */
  tools?: string[];
  /** Dry run — don't write files, just return results */
  dryRun?: boolean;
  /** Skip scanning — use config.detected instead */
  skipScan?: boolean;
}

export interface GenerateResult {
  scan: ScanResult;
  emitResults: EmitResult[];
  matchedPresets: string[];
  targetTools: string[];
}

/**
 * Core engine: orchestrates scan → preset match → section merge → emit.
 *
 * Pipeline:
 *   1. Scan project (or use cached scan from config)
 *   2. Match presets based on scan result + config overrides
 *   3. Generate RuleSections from matched presets
 *   4. Merge sections (deduplicate by id, custom rules appended)
 *   5. Emit formatted files for each target tool
 */
export async function generate(options: GenerateOptions): Promise<GenerateResult> {
  const { projectRoot, tools, skipScan } = options;

  // Step 1: Load config or use provided
  const config = options.config ?? await loadConfig(projectRoot);

  // Step 2: Scan project
  let scan: ScanResult;
  if (skipScan && config?.detected) {
    scan = {
      language: config.detected.language ?? 'unknown',
      framework: config.detected.framework ?? null,
      packageManager: config.detected.packageManager ?? null,
      styling: config.detected.styling ?? null,
      testing: config.detected.testing ?? null,
      orm: config.detected.orm ?? null,
      monorepo: config.detected.monorepo ?? false,
      directories: config.detected.directories ?? [],
      dependencies: config.detected.dependencies ?? {},
    };
  } else {
    scan = await scanProject(projectRoot);
  }

  // Step 3: Match presets
  const autoPresets = detectPresets(scan);
  const presetIds = new Set(autoPresets.map((p) => p.id));

  // Add manual presets from config
  if (config?.presets) {
    for (const id of config.presets) {
      presetIds.add(id);
    }
  }

  // Remove excluded presets
  if (config?.exclude) {
    for (const id of config.exclude) {
      presetIds.delete(id);
    }
  }

  // Step 4: Generate sections from all matched presets
  const sections: RuleSection[] = [];
  const matchedPresets: string[] = [];

  for (const id of presetIds) {
    const preset = getPreset(id) ?? autoPresets.find((p) => p.id === id);
    if (preset) {
      matchedPresets.push(preset.id);
      sections.push(...preset.sections(scan));
    }
  }

  // Append custom rules from config
  if (config?.custom) {
    for (const rule of config.custom) {
      sections.push({
        id: `custom-${rule.title.toLowerCase().replace(/\s+/g, '-')}`,
        title: rule.title,
        content: rule.content,
        priority: 'medium',
        tags: ['custom'],
      });
    }
  }

  // Append inline rules from config
  if (config?.rules) {
    sections.push(...config.rules);
  }

  // Deduplicate by id (last one wins)
  const sectionMap = new Map<string, RuleSection>();
  for (const section of sections) {
    sectionMap.set(section.id, section);
  }
  const mergedSections = Array.from(sectionMap.values());

  // Step 5: Determine target tools
  const targetToolIds = tools
    ?? config?.tools
    ?? getAllEmitterIds();

  // Step 6: Emit for each target tool (deduplicate by output path — last emitter wins)
  const emitMap = new Map<string, EmitResult>();
  for (const toolId of targetToolIds) {
    const emitter = getEmitter(toolId);
    if (emitter) {
      for (const result of emitter.emit(mergedSections, scan)) {
        emitMap.set(result.path, result);
      }
    }
  }
  const emitResults = Array.from(emitMap.values());

  return {
    scan,
    emitResults,
    matchedPresets,
    targetTools: targetToolIds,
  };
}

/**
 * List all available preset IDs.
 */
export function listPresets(): string[] {
  return getAllPresetIds();
}

/**
 * List all available tool emitter IDs.
 */
export function listTools(): string[] {
  return getAllEmitterIds();
}
