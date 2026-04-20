import type { CommandDefinition } from '@definition';

import run, { type Options } from './impl.js';

export default {
  name: 'docs',
  description: '',
  summary: '',
  options: [
  ],
  action: (options) => {
    run(options as Options);
  },
} satisfies CommandDefinition;
