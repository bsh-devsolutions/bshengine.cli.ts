import type { CommandDefinition } from '@definition';

import install from './install/cmd.js';

export default {
  name: 'plugins',
  aliases: ['p'],
  description: 'Manage BSH Engine plugins',
  summary: 'Manage BSH Engine plugins',
  subcommands: [install],
} satisfies CommandDefinition;
