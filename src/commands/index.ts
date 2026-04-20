import type { CommandDefinition } from '@src/lib/cli/definition';
import plugins from '@commands/plugins';
import docker from '@commands/docker';
import docs from '@commands/docs';

const commands: CommandDefinition[] = [
    plugins,
    docker,
    docs,
];

export default commands;
