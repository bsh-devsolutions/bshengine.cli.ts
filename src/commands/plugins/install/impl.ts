import { logger } from '@lib/logger';
import { BshEngine } from '@bshsolutions/sdk';
import { createWriteStream, promises as fsPromises } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import archiver from 'archiver';
import { randomUUID } from 'crypto';

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
  const host = options.host;
  const apiKey = options.apiKey;

  if (!host) throw new Error('Host is required. Use --host flag.');
  if (!apiKey) throw new Error('API key is required. Use --api-key flag.');

  return { host, apiKey };
}

export default async function runInstall(
  options: Options,
  pluginDir?: string,
): Promise<void> {
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
    const zipFilename = `${randomUUID()}.zip`;
    const tempZipPath = join(tempDir, zipFilename);

    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(tempZipPath);
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
    const fileStat = await fsPromises.stat(tempZipPath);
    const fileObj = new File([await fsPromises.readFile(tempZipPath)], zipFilename, { type: 'application/zip', lastModified: fileStat.mtimeMs });

    const engine = new BshEngine({
      host: config.host,
      apiKey: config.apiKey,
    });

    const response = await engine.plugins.installZip({
      payload: {
        file: fileObj,
      }
    });

    if (response && response.data) {
      logger.info(JSON.stringify(response, null, 2));
      process.exit(0);
    } else {
      logger.error('Failed to install plugin. No response from server.');
      logger.error(JSON.stringify(response, null, 2));
      process.exit(1);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
