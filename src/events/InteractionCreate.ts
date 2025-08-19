import { Events, ChatInputCommandInteraction } from 'discord.js'
import { KitaClient } from '../client.js';

export const name = Events.InteractionCreate;
export const on = true;

export async function listener(interaction: ChatInputCommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client as KitaClient;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);

        if (interaction.replied) {
            await interaction.followUp({ content: 'This interaction was replied.' });
        } else if (interaction.deferred) {
            await interaction.followUp({ content: 'This interaction was deferred' });
        }
    }
}
