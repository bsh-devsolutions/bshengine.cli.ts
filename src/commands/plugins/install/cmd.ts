import type { CommandDefinition } from '@definition';

import run, { type Options } from './impl.js';

export default {
  name: 'install',
  aliases: ['i'],
  description: 'Install a plugin from a directory',
  summary: 'Install a plugin from a directory',
  positional: [
    { spec: '<plugin-dir>', description: 'Path to the plugin directory' },
  ],
  options: [
    { flags: '-H, --host <host>', description: 'BSH Engine host URL' },
    { flags: '-k, --api-key <key>', description: 'BSH Engine API key' },
  ],
  action: (options, pluginDir) => {
    run(options as Options, pluginDir);
  },
} satisfies CommandDefinition;
