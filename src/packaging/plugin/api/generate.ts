import { exec } from 'child_process';
import { promisify } from 'util';
import { rm, rename, access } from 'fs/promises';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import { logger } from '@src/logger';

const execAsync = promisify(exec);

/**
 * Check if a directory exists
 */
async function directoryExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a plugin from the template repository
 */
export async function generatePlugin(
  targetDir: string,
  pluginName: string,
  templateUrl: string
): Promise<void> {
  const resolvedTargetDir = resolve(targetDir);
  const finalPluginPath = join(resolvedTargetDir, pluginName);

  // Check if target directory exists
  const targetExists = await directoryExists(resolvedTargetDir);
  if (!targetExists) {
    throw new Error(`Target directory does not exist: ${resolvedTargetDir}`);
  }

  // Check if plugin directory already exists
  const pluginExists = await directoryExists(finalPluginPath);
  if (pluginExists) {
    throw new Error(`Plugin already exists: ${finalPluginPath}`);
  }

  // Create a temporary directory for cloning
  const tempDir = join(tmpdir(), `bsh-plugin-template-${Date.now()}`);

  try {
    logger.info(`Cloning template repository: ${templateUrl}`);

    // Clone the repository into temp directory
    await execAsync(`git clone ${templateUrl} "${tempDir}"`);

    // Remove .github directory
    const githubDir = join(tempDir, '.github');
    const githubExists = await directoryExists(githubDir);
    if (githubExists) {
      logger.info('Removing .github directory...');
      await rm(githubDir, { recursive: true, force: true });
    }

    // Remove .git directory to avoid conflicts
    const gitDir = join(tempDir, '.git');
    const gitExists = await directoryExists(gitDir);
    if (gitExists) {
      await rm(gitDir, { recursive: true, force: true });
    }

    // Move the cloned template to the final location
    logger.info(`Creating plugin directory: ${finalPluginPath}`);
    await rename(tempDir, finalPluginPath);

    logger.success(`Plugin "${pluginName}" generated successfully at ${finalPluginPath}`);
  } catch (error) {
    // Clean up temp directory on error
    try {
      const tempExists = await directoryExists(tempDir);
      if (tempExists) {
        await rm(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    if (error instanceof Error) {
      // Check if git is not installed
      if (error.message.includes('git') || error.message.includes('spawn')) {
        throw new Error('Git is required to generate plugins. Please install Git and try again.');
      }
      throw error;
    }
    throw new Error('Failed to generate plugin');
  }
}
