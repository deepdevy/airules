import type { ToolEmitter } from '../types.js';

import { claudeEmitter } from './claude.js';
import { cursorEmitter } from './cursor.js';
import { windsurfEmitter } from './windsurf.js';
import { copilotEmitter } from './copilot.js';
import { clineEmitter } from './cline.js';
import { codexEmitter } from './codex.js';
import { geminiEmitter } from './gemini.js';
import { aiderEmitter } from './aider.js';
import { zedEmitter } from './zed.js';
import { rooEmitter } from './roo.js';
import { amazonqEmitter } from './amazonq.js';
import { opencodeEmitter } from './opencode.js';

/**
 * Registry of all tool emitters.
 * Each emitter knows how to format rules for a specific AI coding tool.
 */
export const emitters: ToolEmitter[] = [
  claudeEmitter,
  cursorEmitter,
  windsurfEmitter,
  copilotEmitter,
  clineEmitter,
  codexEmitter,
  geminiEmitter,
  aiderEmitter,
  zedEmitter,
  rooEmitter,
  amazonqEmitter,
  opencodeEmitter,
];

export function getEmitter(toolId: string): ToolEmitter | undefined {
  return emitters.find((e) => e.id === toolId);
}

export function getAllEmitterIds(): string[] {
  return emitters.map((e) => e.id);
}
