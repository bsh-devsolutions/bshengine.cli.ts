import type { BshEngineConfig } from '@plugin/types';
import { PluginManager } from '@plugin/core/manager';
import { PluginException } from '@plugin/errors';
import { logger } from '@src/logger';

export interface InstallOptions {
  pluginDir?: string;
}

export async function installPlugin(
  config: BshEngineConfig,
  options: InstallOptions = {}
): Promise<void> {
  try {
    const { pluginDir} = options;

    if (!pluginDir) {
      throw new Error('pluginDir is required in options');
    }

    logger.separator();
    logger.info('Installing plugins...');

    const manager = new PluginManager(config);

    await manager.manage({
      path: pluginDir
    });

    logger.success('Plugin installation completed successfully!');
  } catch (error) {
    if (error instanceof PluginException) {
      logger.error(`ERROR: ${error.status} - ${error.message}`);
    } else {
      logger.error(`ERROR: 500 - Error installing plugin: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
