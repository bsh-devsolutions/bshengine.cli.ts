import { logger } from '@src/logger';
import { PluginManager } from '@plugin/core/manager';

export interface ValidateOptions {
  pluginDir: string;
}

export async function validatePlugin(
  options: ValidateOptions
): Promise<void> {
  try {
    const { pluginDir } = options;
    const manager = new PluginManager();
    await manager.validate({ path: pluginDir });
  } catch (error) {
    logger.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
