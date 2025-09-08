import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import createSlashCommand from '../utils/createSlashCommand.js';
import { sendUserMentionMessage } from '../utils/message.js';
import { insertUser, selectUserById, updateUserById } from '../services/index.js';
import { User } from '../db/schema.js';

const USER_MESSAGE = {
  GROWID_NOT_FOUND: 'GrowID not found! Please contact the developer!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ERROR: 'An error occurred while updating your profile. Please try again later or issue a report',
  INVALID_GROWID: 'Invalid GrowID provided!',
};

export default createSlashCommand({
  name: 'profile',
  description: 'Your profile',
  middlewares: [],
  builder: (builder) =>
    builder
      .addStringOption(option =>
        option
          .setName('growid')
          .setDescription('Your GrowID')
          .setRequired(true)
      ),
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const growId = interaction.options.getString('growid');
    if (!growId || growId.trim() === '') {
      await sendUserMentionMessage(interaction, USER_MESSAGE.INVALID_GROWID);

      return;
    }

    const userId = interaction.user.id;
    try {
      const user: User | undefined = await selectUserById(userId);
      if (user) {
        await updateUserById(user.id, { username: growId });
      } else {
        await insertUser({ id: userId, username: growId });
      }

      await sendUserMentionMessage(interaction, USER_MESSAGE.PROFILE_UPDATED);
    } catch (error) {
      console.error(error);
      await sendUserMentionMessage(interaction, USER_MESSAGE.ERROR);
    }
  }
});
