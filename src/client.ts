import { Client, GatewayIntentBits } from 'discord.js';
import type { Command } from './types/command.js';

export class KitaClient extends Client {
    public commands: Map<string, Command> = new Map<string, Command>();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
            ]
        })
    }
}
