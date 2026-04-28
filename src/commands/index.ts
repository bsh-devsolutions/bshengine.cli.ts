import type { CommandDefinition } from '@src/lib/cli/definition';
import plugins from '@commands/plugins';

const commands: CommandDefinition[] = [
    plugins
];

export default commands;
