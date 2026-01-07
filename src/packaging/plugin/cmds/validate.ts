import { Command } from 'commander';
import { validatePlugin } from '@plugin/api/validate';
import { logger } from '@src/logger';

export function createValidateCommand(): Command {
  const command = new Command('validate')
    .alias('v');

  command
    .description('Validate a plugin without installing it to the instance')
    .argument('<plugin-dir>', 'Path to the plugin directory')

  command.action(async (pluginDir: string) => {
    try {
      await validatePlugin({ pluginDir });
      process.exit(0);
    } catch (error) {
      logger.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

  return command;
}

