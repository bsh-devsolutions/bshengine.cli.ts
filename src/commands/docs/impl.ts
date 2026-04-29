import { exec } from 'child_process';

const DOCS_URL = 'https://docs.bousalih.com/docs/bsh-engine/cli';

function getOpenCommand(url: string): string {
  switch (process.platform) {
    case 'darwin':
      return `open "${url}"`;
    case 'win32':
      return `start "" "${url}"`;
    default:
      return `xdg-open "${url}"`;
  }
}

export function openDocs(url = DOCS_URL): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(getOpenCommand(url), error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export { DOCS_URL };
