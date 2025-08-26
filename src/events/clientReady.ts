import { Client, Events } from 'discord.js';
import { setupLogger } from '../utils/logger.js';
import { Event } from '../types/index.js';
import 'dotenv/config';

export const event: Event<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  listener: async (client: Client) => {
    if (!client.user) {
      throw new Error('Missing client user!');
    }

    console.info(`Ready! Logged in as ${client.user.tag}`);

    const LOG_CHANNEL_ID = process.env['LOG_CHANNEL_ID'];
    if (!LOG_CHANNEL_ID) {
      throw new Error('Missing LOG_CHANNEL_ID environment variable.');
    }
    await setupLogger(client, LOG_CHANNEL_ID);
  }
};

export default event;
