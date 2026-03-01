export type {
  ScanResult,
  RuleSection,
  Preset,
  ToolEmitter,
  EmitResult,
  AirulesConfig,
  CustomRule,
} from './types.js';

export { GENERATED_HEADER } from './types.js';
export { scanProject } from './core/scanner.js';
export { generate, listPresets, listTools } from './core/engine.js';
export type { GenerateOptions, GenerateResult } from './core/engine.js';
export { loadConfig, saveConfig } from './core/config.js';
export { emitters, getEmitter, getAllEmitterIds } from './emitters/index.js';
export { presets, detectPresets, getPreset, getAllPresetIds } from './presets/index.js';
