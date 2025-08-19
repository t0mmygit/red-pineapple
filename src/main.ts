import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KitaClient } from './client.js';
import 'dotenv/config';

const client = new KitaClient();

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function loadEvents() {
    const eventsPath = resolve(__dirname, './events');
    const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith('.ts'));

    for (const file of eventFiles) {
        const filePath = resolve(eventsPath, file);
        const event = await import(filePath);

        if ('name' in event && 'listener' in event) {
            if (event.once) {
                client.once(event.name, event.listener);
            } else if (event.on) {
                client.on(event.name, event.listener);
            }
        }
    }
}

async function loadCommands() {
    const commandsPath = resolve(__dirname, './commands');
    const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));

    for (const file of commandFiles) {
        const filePath = resolve(commandsPath, file);
        const { default: command } = await import(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

async function start() {
    await loadEvents();
    await loadCommands();

    client.login(process.env.DISCORD_SECRET);
}

start();
