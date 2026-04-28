import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { getConfig, loadConfig } from '@config';
import middleware from '@lib/middleware';
import commands from '@commands';
import cli from '@lib/cli';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

const program = new Command();

program
  .name('bsh')
  .description('BSH Engine Manager - A CLI tool for managing BSH Engine')
  .version(packageJson.version);

void (async () => {
  await loadConfig();
  console.log(getConfig());
  cli(program, commands);
  await middleware(program);
})();
