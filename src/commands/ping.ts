import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/command.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pinging...');

        const reply = await interaction.fetchReply();
        const apiLatency = Math.round(reply.createdTimestamp - interaction.createdTimestamp);
        const wsLatency = interaction.client.ws.ping;

        await interaction.editReply({ content: `Pong! \nAPI Latency: ${apiLatency}\nWebSocket Latency: ${wsLatency}` });
    }
} as Command;
