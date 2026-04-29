import type { CommandDefinition } from '@definition';

import { logger } from '@lib/logger';

import { DOCS_URL, openDocs } from './impl.js';

export default {
  name: 'docs',
  description: 'Open the BSH Engine CLI documentation in your browser',
  summary: 'Open BSH Engine CLI documentation',
  action: async () => {
    try {
      logger.info(`Opening documentation: ${DOCS_URL}`);
      await openDocs();
      process.exit(0);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      logger.info(`Please visit: ${DOCS_URL}`);
      process.exit(1);
    }
  },
} satisfies CommandDefinition;
