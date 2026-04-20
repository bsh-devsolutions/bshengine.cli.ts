import { logger } from '@lib/logger';

export type Options = {
};

export default async function runPlugins(options: Options): Promise<void> {
  logger.info(`plugins command`);
}
