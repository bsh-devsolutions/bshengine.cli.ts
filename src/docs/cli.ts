import { Command } from 'commander';
import { exec } from 'child_process';
import { logger } from '@src/logger';

const DOCS_URL = 'https://docs.bousalih.com/docs/bsh-engine/cli';

/**
 * Opens the docs URL in the default browser
 */
function openDocs(): Promise<void> {
  return new Promise((resolve, reject) => {
    const platform = process.platform;
    let command: string;

    switch (platform) {
      case 'darwin':
        command = `open "${DOCS_URL}"`;
        break;
      case 'win32':
        command = `start "" "${DOCS_URL}"`;
        break;
      default:
        // Linux and other Unix-like systems
        command = `xdg-open "${DOCS_URL}"`;
        break;
    }

    exec(command, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function createDocsCommand(): Command {
  const command = new Command('docs')
    .description('Open the BSH Engine CLI documentation in your browser');

  command.action(async () => {
    try {
      logger.info(`Opening documentation: ${DOCS_URL}`);
      await openDocs();
      process.exit(0);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      logger.info(`Please visit: ${DOCS_URL}`);
      process.exit(1);
    }
  });

  return command;
}
