import { logger } from '@lib/logger';
import { BshEngine } from '@bshsolutions/sdk';
import { createWriteStream, promises as fsPromises } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import archiver from 'archiver';
import { randomUUID } from 'crypto';
import { getConfig } from '@config';

export type Options = {
  host?: string;
  apiKey?: string;
};

async function resolvePluginDirectory(inputPath: string): Promise<string> {
  const candidateBases = [process.cwd(), process.env.INIT_CWD].filter(
    (value): value is string => Boolean(value),
  );

  for (const base of candidateBases) {
    const candidate = resolve(base, inputPath);
    const stat = await fsPromises.stat(candidate).catch(() => null);
    if (stat?.isDirectory()) return candidate;
  }

  throw new Error(
    [
      `Plugin directory does not exist or is not a directory: ${inputPath}`,
      `Checked from cwd: ${resolve(process.cwd(), inputPath)}`,
      process.env.INIT_CWD
        ? `Checked from INIT_CWD: ${resolve(process.env.INIT_CWD, inputPath)}`
        : 'INIT_CWD is not set',
    ].join('\n'),
  );
}

function getBshEngineConfig(options: Options): { host: string; apiKey: string } {
  const engineConfig = getConfig().engine;
  const host = options.host ?? engineConfig.host;
  const apiKey = options.apiKey ?? engineConfig.apiKey;

  if (!host) {
    throw new Error(
      'Host is required. Use --host flag or set `engine.host` in .bshsolutions/cli.json.',
    );
  }
  if (!apiKey) {
    throw new Error(
      'API key is required. Use --api-key flag or set `engine.apiKey` in .bshsolutions/cli.json.',
    );
  }

  return { host, apiKey };
}

function getHistoryDetailsLink(host: string, historyId?: number | string): string | null {
  if (historyId === undefined || historyId === null) return null;
  return `${host.replace(/\/+$/, '')}/plugins/history/${historyId}`;
}

export default async function runInstall(
  options: Options,
  pluginDir?: string,
): Promise<void> {
  let tempZipPath: string | undefined;

  try {
    if (!pluginDir) throw new Error('Plugin directory argument is required.');
    const resolvedPluginDir = await resolvePluginDirectory(pluginDir);
    const pluginEntries = await fsPromises.readdir(resolvedPluginDir);
    if (pluginEntries.length === 0) {
      throw new Error(`Plugin directory is empty: ${resolvedPluginDir}`);
    }

    const config = getBshEngineConfig(options);

    // 1. Zip the plugin directory
    const tempDir = tmpdir();
    await fsPromises.mkdir(tempDir, { recursive: true });
    const zipFilename = `bshplugin-${randomUUID()}.zip`;
    tempZipPath = join(tempDir, zipFilename);
    const zipPath = tempZipPath;

    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      output.on('error', reject);
      archive.on('error', reject);
      archive.on('warning', warning => reject(warning));

      archive.pipe(output);
      archive.directory(resolvedPluginDir, false);
      archive.finalize().catch(reject);
    });

    // 2. Upload the zip file to the BSH Engine
    const fileStat = await fsPromises.stat(zipPath);
    const fileObj = new File([await fsPromises.readFile(zipPath)], zipFilename, { type: 'application/zip', lastModified: fileStat.mtimeMs });

    const engine = new BshEngine({
      host: config.host,
      apiKey: config.apiKey,
    });

    const response = await engine.plugins.installZip({
      payload: {
        file: fileObj,
      }
    });

    if (response && response.data && response.data.length > 0) {
      const installResult = response.data[0];
      const historyLink = getHistoryDetailsLink(config.host, installResult.history);
      logger.info(`Plugin installed: ${installResult.pluginName} (${installResult.pluginId})`);
      logger.info(`Files: total=${installResult.totalFiles}, success=${installResult.successCount}, failed=${installResult.failedCount}`);
      if (historyLink) {
        logger.info(`Details: ${historyLink}`);
      }
      process.exit(0);
    } else {
      logger.error('Failed to install plugin. No response from server.');
      logger.error(JSON.stringify(response, null, 2));
      process.exit(1);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    if (tempZipPath) {
      await fsPromises.rm(tempZipPath, { force: true }).catch(() => undefined);
    }
  }
}
