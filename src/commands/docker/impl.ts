import { logger } from '@lib/logger';

export type Options = {
};

export default async function runDocker(options: Options): Promise<void> {
  logger.info(`docker command`);
}
