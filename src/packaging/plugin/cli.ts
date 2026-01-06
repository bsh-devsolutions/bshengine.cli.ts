import { Command } from 'commander';
import { createInstallCommand } from './cmds/install';
import { createValidateCommand } from './cmds/validate';

/**
 * Creates the plugins command group with all plugin-related subcommands
 */
export function createPluginsCommand(): Command {
  const pluginsCommand = new Command('plugins')
    .description('Manage BSH Engine plugins');

  // Register all plugin commands
  pluginsCommand.addCommand(createInstallCommand());
  pluginsCommand.addCommand(createValidateCommand());

  return pluginsCommand;
}

