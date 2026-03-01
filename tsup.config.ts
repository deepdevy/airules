import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: true,
    clean: true,
    target: 'node18',
    splitting: false,
    sourcemap: true,
  },
  {
    entry: { cli: 'src/cli.ts' },
    format: ['esm'],
    dts: false,
    clean: false,
    target: 'node18',
    splitting: false,
    sourcemap: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
