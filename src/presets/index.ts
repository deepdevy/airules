import type { Preset, ScanResult } from '../types.js';
import { generalPreset } from './general.js';
import { typescriptPreset } from './typescript.js';
import { nextjsPreset } from './nextjs.js';
import { reactPreset } from './react.js';
import { vuePreset } from './vue.js';
import { expressPreset } from './express.js';
import { fastapiPreset } from './fastapi.js';
import { djangoPreset } from './django.js';
import { goPreset } from './go.js';
import { rustPreset } from './rust.js';

/**
 * Registry of all available presets.
 * Each preset provides framework-specific rules based on scan results.
 */
export const presets: Preset[] = [
  generalPreset,
  typescriptPreset,
  nextjsPreset,
  reactPreset,
  vuePreset,
  expressPreset,
  fastapiPreset,
  djangoPreset,
  goPreset,
  rustPreset,
];

/**
 * Auto-detect which presets apply to this project.
 */
export function detectPresets(scan: ScanResult): Preset[] {
  return presets.filter((p) => p.detect(scan));
}

export function getPreset(id: string): Preset | undefined {
  return presets.find((p) => p.id === id);
}

export function getAllPresetIds(): string[] {
  return presets.map((p) => p.id);
}
