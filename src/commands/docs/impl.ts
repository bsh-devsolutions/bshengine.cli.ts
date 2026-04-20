import { logger } from '@lib/logger';

export type Options = {
};

export default async function (options: Options): Promise<void> {
  logger.info(`docs command`);
}
