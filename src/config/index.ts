import { readFile } from 'fs/promises';
import { join } from 'path';

type LoggerConfig = {
  level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
};

export type Config = {
  logger: LoggerConfig;
  engine: {
    host?: string;
    apiKey?: string;
  };
};

export const defaultConfig: Config = {
  logger: {
    level: 'info',
  },
  engine: {},
};

let instance: Config = {
  ...defaultConfig,
  logger: { ...defaultConfig.logger },
  engine: { ...defaultConfig.engine },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeConfig(raw: unknown): Config {
  if (!isObject(raw)) return instance;

  const next: Config = {
    ...defaultConfig,
    logger: { ...defaultConfig.logger },
    engine: { ...defaultConfig.engine },
  };

  if (isObject(raw.logger)) {
    if (typeof raw.logger.level === 'string') {
      next.logger.level = raw.logger.level as LoggerConfig['level'];
    }
  }

  if (isObject(raw.engine)) {
    if (typeof raw.engine.host === 'string') {
      next.engine.host = raw.engine.host;
    }
    if (typeof raw.engine.apiKey === 'string') {
      next.engine.apiKey = raw.engine.apiKey;
    }
  }

  return next;
}

export function getConfig(): Config {
  return instance;
}

export async function loadConfig(): Promise<Config> {
  const filePath = join(process.cwd(), '.bshsolutions', 'cli.json');

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    instance = mergeConfig(parsed);
    return instance;
  } catch {
    instance = {
      ...defaultConfig,
      logger: { ...defaultConfig.logger },
      engine: { ...defaultConfig.engine },
    };
    return instance;
  }
}
