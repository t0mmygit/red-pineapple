import 'dotenv/config';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const __dirname = fileURLToPath(new URL('../', import.meta.url));

export const allowedExt = process.env['NODE_ENV'] !== 'production'
  ? ['.ts', 'js']
  : ['.js'];

export const commandNameList = async (): Promise<string[]> => {
  const commandList: string[] = [];

  const eventsPath = resolve(__dirname, './commands');
  const eventFiles = readdirSync(eventsPath).filter(file =>
    allowedExt.some(ext => file.endsWith(ext))
  );

  for (const file of eventFiles) {
    const filePath = resolve(eventsPath, file);
    const { default: command } = await import(filePath);

    commandList.push(command.data.name);
  }

  return commandList;
};
