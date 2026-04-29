import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import { logger } from '@lib/logger';

import { getConfig, loadConfig } from '@config';

function buildConfigContent(config: ReturnType<typeof getConfig>): string {
  const fileConfig = {
    logger: {
      level: config.logger.level,
    },
    engine: {
      host: config.engine.host ?? null,
      apiKey: config.engine.apiKey ?? null,
    },
  };
  return `${JSON.stringify(fileConfig, null, 2)}\n`;
}

export default async function runInit(): Promise<void> {
  const configDir = join(process.cwd(), '.bshsolutions');
  const configPath = join(configDir, 'cli.json');

  try {
    const oldContent = await readFile(configPath, 'utf8').catch(() => null);
    await loadConfig();
    const config = getConfig();
    const content = buildConfigContent(config);

    await mkdir(configDir, { recursive: true });
    await writeFile(configPath, content, 'utf8');

    if (oldContent === null) {
      logger.info(`Created config file: ${configPath}`);
      return;
    }

    logger.info(`Updated config file with missing defaults: ${configPath}`);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
