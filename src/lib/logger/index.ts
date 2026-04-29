import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import pino, { type Logger, type LoggerOptions } from 'pino';
import pinoPretty from 'pino-pretty';

import { getConfig } from '@config';

import { BshError } from '@lib/errors';

const loggerConfig = () => getConfig().logger;
const level = (): LoggerOptions['level'] => loggerConfig().level;

function readAppName(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 24; i += 1) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const raw = readFileSync(pkgPath, 'utf8');
        const name = (JSON.parse(raw) as { name?: unknown }).name;
        if (typeof name === 'string' && name.trim() !== '') return name.trim();
      } catch {
        // keep walking
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return 'cli';
}

const PRETTY_BASE = {
  translateTime: false,
  ignore: 'time,pid,hostname,name,appName,level',
  singleLine: true,
  messageFormat: '[{appName}] [{levelLabel}] {msg}',
} as const;

function createPrettyDestination(
  destination: string | number,
  opts: { colorize: boolean; mkdir?: boolean },
) {
  return pinoPretty({
    ...PRETTY_BASE,
    colorize: opts.colorize,
    destination,
    sync: true,
    ...(opts.mkdir ? { mkdir: true as const } : {}),
  });
}

function createDestination() {
  if (process.stdout.isTTY) {
    const consoleDest = createPrettyDestination(1, { colorize: true });
    return consoleDest;
  }

  const consoleDest = pino.destination({ dest: 1, sync: true, minLength: 0 });
  return consoleDest;
}

function serializeErr(err: Error): Record<string, unknown> {
  const base = pino.stdSerializers.err(err) as Record<string, unknown>;
  if (err instanceof BshError) {
    return {
      ...base,
      code: err.code,
      ...(err.context !== undefined && { context: err.context }),
    };
  }
  return base;
}

function buildBaseOptions(): LoggerOptions {
  return {
    level: level(),
    base: { appName: readAppName() },
    serializers: {
      err: serializeErr,
    },
    redact: {
      paths: [
        'password',
        'token',
        'accessToken',
        'refreshToken',
        'authorization',
        'cookie',
        'cookies',
        'set-cookie',
        '*.password',
        '*.token',
        '*.authorization',
      ],
      censor: '[redacted]',
    },
  };
}

let rootLogger: Logger | undefined;

function getRootLogger(): Logger {
  if (!rootLogger) {
    rootLogger = pino(buildBaseOptions(), createDestination());
  }
  return rootLogger;
}

export function Logger(name?: string): Logger {
  const root = getRootLogger();
  return name ? root.child({ name }) : root;
}

export const logger = new Proxy({} as Logger, {
  get(_target, prop) {
    const inst = getRootLogger();
    const value = (inst as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(inst) : value;
  },
});
