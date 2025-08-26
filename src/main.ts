import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KitaClient } from './client.js';
import 'dotenv/config';
import { loadButtons } from './handlers/button/index.js';
import { loadModals } from './handlers/modal/index.js';

const client = new KitaClient();

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function loadEvents(): Promise<boolean> {
  console.info('Loading Events...');

  const eventsPath = resolve(__dirname, './events');
  const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith('.ts'));

  for (const file of eventFiles) {
    const filePath = resolve(eventsPath, file);
    const { default: event } = await import(filePath);

    if ('name' in event && 'listener' in event) {
      if (event.once) {
        client.once(event.name, event.listener);
      } else {
        client.on(event.name, event.listener);
      }
    }
  }

  return true;
}

async function loadCommands(): Promise<boolean> {
  console.info('Loading Commands...');

  const commandsPath = resolve(__dirname, './commands');
  const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));

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
}

async function start() {
  const eventLoaded = await loadEvents();
  if (eventLoaded) {
    console.info('Events loaded successfully!');
  }

  client.on('shardConnect', () => console.log('WebSocket Connected!'));
  client.on('shardDisconnect', (ev) => console.log('Disconnected: ', ev));
  client.on('debug', (info) => console.log('[DEBUG]', info));
  client.on('warn', (info) => console.log('[WARN]', info));
  client.on('error', (err) => console.log('[ERROR]', err));

  const commandLoaded = await loadCommands();
  if (commandLoaded) {
    console.info('Commands loaded successfully!');
  }

  const buttonLoaded = await loadButtons();
  if (buttonLoaded) {
    console.info('Button loaded successfully!');
  }

  const modalLoaded = await loadModals();
  if (modalLoaded) {
    console.info('Modal loaded successfully!');
  }

  console.info('Establishing websocket connection to Discord...');
  try {
    const token = process.env['DISCORD_TOKEN'];
    if (!token) throw new Error('Missing token!');

    await client.login(token);
  } catch (error) {
    console.info(error);
  }
}

await start();
