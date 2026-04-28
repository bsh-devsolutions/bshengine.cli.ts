import type { CommandDefinition } from '@src/lib/cli/definition';
import init from '@commands/init';
import plugins from '@commands/plugins';

const commands: CommandDefinition[] = [
  init,
  plugins,
];

export default commands;
