import { REST, RESTPutAPIApplicationCommandsResult, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KitaClient } from './client.js';
import { allowedExt } from './utils/helper.js';
import 'dotenv/config';

const commands = new KitaClient().commands;

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const commandsPath = resolve(__dirname, './commands');
const commandFiles = readdirSync(commandsPath).filter((file) =>
  allowedExt.some(ext => file.endsWith(ext))
);

for (const file of commandFiles) {
  const filePath = resolve(commandsPath, file);
  const { default: command } = await import(filePath);

  if ('data' in command && 'execute' in command) {
    commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

const token = process.env['DISCORD_TOKEN'];
const clientId = process.env['CLIENT_ID'];
const guildId = process.env['GUILD_ID'];
const environment = process.env['NODE_ENV'];

if (!token || !clientId || !guildId) {
  throw new Error('Required environment variables are missing!');
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.size} application (/) commands.`);
    const body = [...commands.values()].map(command => command.data.toJSON());

    let data: RESTPutAPIApplicationCommandsResult;

    if (environment === 'development') {
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId), { body }
      ) as RESTPutAPIApplicationCommandsResult;
    } else if (environment === 'production') {
      data = await rest.put(
        Routes.applicationCommands(clientId), { body }
      ) as RESTPutAPIApplicationCommandsResult;
    } else {
      console.log('NODE_ENV must be development or production');

      return;
    }

    if (data && Array.isArray(data)) {
      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
  } catch (error) {
    console.error(error);
  }
})();
