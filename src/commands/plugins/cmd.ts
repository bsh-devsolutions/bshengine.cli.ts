import type { CommandDefinition } from '@definition';

import run, { type Options } from './impl.js';
import generate from './generate/cmd.js';
import install from './install/cmd.js';
import validate from './validate/cmd.js';

export default {
  name: 'plugins',
  description: '',
  summary: '',
  action: (options) => {
    run(options as Options);
  },
  subcommands: [
    generate,
    install,
    validate,
  ]
} satisfies CommandDefinition;
