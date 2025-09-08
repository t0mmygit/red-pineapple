import { ChatInputCommandInteraction } from 'discord.js';
import createSlashCommand from '../utils/createSlashCommand.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

export default createSlashCommand({
  name: 'ping',
  description: 'Replies with pong!',
  middlewares: [isAuthenticated],
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Pinging...');

    const reply = await interaction.fetchReply();
    const apiLatency = Math.round(reply.createdTimestamp - interaction.createdTimestamp);
    const wsLatency = interaction.client.ws.ping;

    await interaction.editReply(
      { content: `Pong! \nAPI Latency: ${apiLatency}\nWebSocket Latency: ${wsLatency}` }
    );
  }
});
