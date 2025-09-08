import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { __dirname, allowedExt } from '../../utils/helper.js';
import { KitaClient } from '../../client.js';

export const loadCommands = async (client: KitaClient): Promise<boolean> => {
  console.info('Loading Commands...');

  const commandsPath = resolve(__dirname, './commands');
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    allowedExt.some((ext) => file.endsWith(ext))
  );

  for (const file of commandFiles) {
    const filePath = resolve(commandsPath, file);
    const { default: command } = await import(filePath);

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }

  return true;
};
