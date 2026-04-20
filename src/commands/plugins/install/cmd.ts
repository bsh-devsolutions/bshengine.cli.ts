import type { CommandDefinition } from '@definition';

import run, { type Options } from './impl.js';

export default {
  name: 'install',
  description: '',
  summary: '',
  action: (options) => {
    run(options as Options);
  },
} satisfies CommandDefinition;
