import { ChatInputCommandInteraction, inlineCode, Interaction } from 'discord.js';
import { selectUserById } from '../services/index.js';
import { UserNotFoundError } from '../utils/errors.js';
import { createTimeoutMessage } from '../utils/message.js';

export const isAuthenticated = async (
  interaction: Interaction
): Promise<boolean> => {
  try {
    const user = await selectUserById(interaction.user.id);

    if (!user) {
      throw new UserNotFoundError(interaction.user.id);
    }

    return true;
  } catch (error) {
    console.error(error);

    if (
      error instanceof UserNotFoundError &&
      interaction instanceof ChatInputCommandInteraction
    ) {
      await createTimeoutMessage(
        interaction,
        `Profile not found! Did you register through ${inlineCode('/profile')} yet?`
      );
    }

    return false;
  }
};
