import type { CommandDefinition } from '@definition';

import run from './impl.js';

export default {
  name: 'init',
  description: 'Create or update .bshsolutions/cli.json',
  summary: 'Create or update CLI config file',
  action: () => {
    run();
  },
} satisfies CommandDefinition;
