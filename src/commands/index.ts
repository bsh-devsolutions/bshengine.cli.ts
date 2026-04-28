import type { CommandDefinition } from '@src/lib/cli/definition';
import init from '@commands/init';
import plugins from '@commands/plugins';
import docs from '@commands/docs';

const commands: CommandDefinition[] = [
  init,
  plugins,
  docs,
];

export default commands;
