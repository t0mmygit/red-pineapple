import {
  Interaction,
  MessageFlags,
  PermissionFlagsBits,
  userMention
} from 'discord.js';
import { Middleware } from '../types/index.js';

export const isAdministrator: Middleware = async (
  interaction: Interaction
): Promise<boolean> => {
  if (
    'memberPermissions' in interaction &&
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
  ) {
    return true;
  }

  if (interaction.isRepliable()) {
    await interaction.reply({
      content: `${userMention(interaction.user.id)} Administrator Only!`,
      flags: MessageFlags.Ephemeral
    });
  }

  return false;
};
