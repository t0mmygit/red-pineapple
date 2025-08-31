import { Events, Interaction } from 'discord.js';
import { inlineCode } from '@discordjs/formatters';

import { KitaClient } from '../client.js';
import { Event } from '../types/index.js';
import { COLORS } from '../utils/constant.js';
import { logEvent } from '../utils/logger.js';
import { handleButton } from '../handlers/button/index.js';
import { handleModal } from '../handlers/modal/index.js';
import { runMiddleware } from '../middlewares/index.js';

let status = true;

export const event: Event<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  once: false,
  listener: async (interaction: Interaction) => {
    if (interaction.isButton()) {
      await handleButton(interaction);
    }

    if (interaction.isModalSubmit()) {
      await handleModal(interaction);
    }

    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client as KitaClient;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      const passed = await runMiddleware(interaction, command.middlewares);
      if (!passed) return;

      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing command ${interaction.commandName}:`, error);
      status = false;

      if (interaction.replied) {
        await interaction.followUp({ content: 'This interaction was replied.' });
      } else if (interaction.deferred) {
        await interaction.followUp({ content: 'This interaction was deferred' });
      }
    }

    if (!interaction.guild) {
      throw new Error('Application only support guild interaction!');
    }

    await logEvent(
      'Slash Command',
      `${inlineCode(interaction.commandName)} was executed`,
      interaction.guild.name, {
      user: interaction.user.tag,
      userId: interaction.user.id,
    }, status ? COLORS.INFO : COLORS.ERROR);
  }
};

export default event;
