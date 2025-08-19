import { Client, Events } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export function listener(client: Client) {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
}
