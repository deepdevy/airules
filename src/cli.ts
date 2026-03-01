

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { generate, listPresets, listTools } from './core/engine.js';
import { loadConfig, saveConfig } from './core/config.js';
import type { AirulesConfig } from './types.js';

const program = new Command();

program
  .name('airulegen')
  .description('One command. Every AI coding tool. Zero config.')
  .version('0.1.0');

program
  .command('init')
  .description('Scan project and generate AI rule files for all tools')
  .option('-t, --tools <tools>', 'Comma-separated list of tools to generate for')
  .option('--dry-run', 'Preview without writing files')
  .action(async (options: { tools?: string; dryRun?: boolean }) => {
    const projectRoot = process.cwd();
    const tools = options.tools?.split(',').map((t) => t.trim());

    const spinner = ora('Scanning project...').start();

    try {
      const result = await generate({
        projectRoot,
        tools,
        dryRun: options.dryRun,
      });

      spinner.succeed('Project scanned');

      // Display detected stack
      console.log();
      console.log(chalk.bold('Detected Stack:'));
      console.log(`  Language:        ${chalk.cyan(result.scan.language)}`);
      if (result.scan.framework) console.log(`  Framework:       ${chalk.cyan(result.scan.framework)}`);
      if (result.scan.packageManager) console.log(`  Package Manager: ${chalk.cyan(result.scan.packageManager)}`);
      if (result.scan.styling) console.log(`  Styling:         ${chalk.cyan(result.scan.styling)}`);
      if (result.scan.testing) console.log(`  Testing:         ${chalk.cyan(result.scan.testing)}`);
      if (result.scan.orm) console.log(`  ORM:             ${chalk.cyan(result.scan.orm)}`);
      if (result.scan.monorepo) console.log(`  Monorepo:        ${chalk.cyan('yes')}`);

      // Display matched presets
      console.log();
      console.log(chalk.bold('Matched Presets:'));
      for (const preset of result.matchedPresets) {
        console.log(`  ${chalk.green('\u2713')} ${preset}`);
      }

      // Write files or show dry-run
      console.log();
      if (options.dryRun) {
        console.log(chalk.yellow('Dry run \u2014 no files written.'));
        console.log();
        console.log(chalk.bold('Would generate:'));
        for (const emit of result.emitResults) {
          console.log(`  ${chalk.dim(emit.path)}`);
        }
      } else {
        const writeSpinner = ora('Writing rule files...').start();
        let written = 0;

        for (const emit of result.emitResults) {
          const fullPath = join(projectRoot, emit.path);
          await mkdir(dirname(fullPath), { recursive: true });
          await writeFile(fullPath, emit.content, 'utf-8');
          written++;
        }

        writeSpinner.succeed(`Generated ${written} rule file${written !== 1 ? 's' : ''}`);

        // Save config
        const config: AirulesConfig = {
          version: 1,
          tools: result.targetTools,
          presets: result.matchedPresets,
          detected: result.scan,
        };
        await saveConfig(projectRoot, config);

        console.log();
        console.log(chalk.bold('Generated files:'));
        for (const emit of result.emitResults) {
          console.log(`  ${chalk.green('\u2713')} ${emit.path}`);
        }
        console.log(`  ${chalk.green('\u2713')} .airules.yaml`);
      }

      console.log();
      console.log(chalk.dim('Run `npx airules sync` to regenerate from config.'));
    } catch (err) {
      spinner.fail('Failed');
      console.error(chalk.red(err instanceof Error ? err.message : String(err)));
      process.exit(1);
    }
  });

program
  .command('sync')
  .description('Regenerate rule files from existing .airules.yaml config')
  .action(async () => {
    const projectRoot = process.cwd();
    const spinner = ora('Loading config...').start();

    try {
      const config = await loadConfig(projectRoot);
      if (!config) {
        spinner.fail('No .airules.yaml found. Run `npx airules init` first.');
        process.exit(1);
      }

      spinner.text = 'Regenerating rule files...';

      const result = await generate({
        projectRoot,
        config,
        skipScan: true,
      });

      let written = 0;
      for (const emit of result.emitResults) {
        const fullPath = join(projectRoot, emit.path);
        await mkdir(dirname(fullPath), { recursive: true });
        await writeFile(fullPath, emit.content, 'utf-8');
        written++;
      }

      spinner.succeed(`Regenerated ${written} rule file${written !== 1 ? 's' : ''}`);

      console.log();
      for (const emit of result.emitResults) {
        console.log(`  ${chalk.green('\u2713')} ${emit.path}`);
      }
    } catch (err) {
      spinner.fail('Failed');
      console.error(chalk.red(err instanceof Error ? err.message : String(err)));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available presets and supported tools')
  .action(() => {
    console.log(chalk.bold('\nAvailable Presets:'));
    for (const id of listPresets()) {
      console.log(`  ${chalk.cyan(id)}`);
    }

    console.log(chalk.bold('\nSupported Tools:'));
    for (const id of listTools()) {
      console.log(`  ${chalk.cyan(id)}`);
    }
    console.log();
  });

program
  .command('add <preset>')
  .description('Add a specific preset to your config')
  .action(async (presetId: string) => {
    const projectRoot = process.cwd();

    // Verify preset exists
    const allPresets = listPresets();
    if (!allPresets.includes(presetId)) {
      console.error(chalk.red(`Unknown preset: ${presetId}`));
      console.log(`Available presets: ${allPresets.join(', ')}`);
      process.exit(1);
    }

    // Load or create config
    let config = await loadConfig(projectRoot);
    if (!config) {
      console.log(chalk.yellow('No .airules.yaml found. Run `npx airules init` first.'));
      process.exit(1);
    }

    // Add preset
    config.presets = config.presets ?? [];
    if (config.presets.includes(presetId)) {
      console.log(chalk.yellow(`Preset "${presetId}" is already active.`));
      return;
    }

    config.presets.push(presetId);
    await saveConfig(projectRoot, config);
    console.log(chalk.green(`\u2713 Added preset "${presetId}". Run \`npx airules sync\` to regenerate.`));
  });

program.parse();
