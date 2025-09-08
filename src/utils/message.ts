import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message, subtext, userMention
} from 'discord.js';
import { MESSAGE_DELETE_TIMEOUT } from './constant.js';

export const createTimeoutMessage = async (
  interaction: ChatInputCommandInteraction,
  content: string,
  text = '',
  delay = MESSAGE_DELETE_TIMEOUT
): Promise<void> => {
  const mention = userMention(interaction.user.id);

  if (!text) {
    text = subtext(`Message will be deleted in ${delay / 1000} seconds`);
  } else {
    text = subtext(text);
  }

  let response: Message | InteractionResponse;
  const replyContent = { content: `${mention} ${content}\n${text}` };

  if (interaction.replied || interaction.deferred) {
    response = await interaction.editReply(replyContent);
  } else {
    response = await interaction.reply(replyContent);
  }

  setTimeout(async () => {
    try {
      await response.delete();
    } catch (error) {
      console.error('Failed to delete message: ', error);
    }
  }, delay);
};

export const sendUserMentionMessage = async (
  interaction: ChatInputCommandInteraction,
  message: string
): Promise<undefined> => {
  const userId = interaction.user.id;
  const replyContent = { content: `${userMention(userId)} ${message}` };

  if (interaction.replied || interaction.deferred) {
    await interaction.editReply(replyContent);
  } else {
    await interaction.reply(replyContent);
  }
};
