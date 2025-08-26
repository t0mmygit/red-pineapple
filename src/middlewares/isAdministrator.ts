import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  userMention
} from 'discord.js';
import { Middleware } from '../types';

export const isAdministrator: Middleware = async (interaction: ChatInputCommandInteraction) => {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return true;
  }
  await interaction.reply({
    content: `${userMention(interaction.user.id)} Administrator Only!`,
    flags: MessageFlags.Ephemeral
  });

  return false;
};
