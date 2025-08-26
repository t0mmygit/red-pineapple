import { ButtonInteraction, EmbedBuilder, userMention } from 'discord.js';
import { registerButton } from './index.js';
import { COLORS } from '../../utils/constant.js';
import { isAdministrator } from '../../middlewares/isAdministrator.js';

export default registerButton({
  id: 'reject',
  middlewares: [isAdministrator],
  run: async (interaction: ButtonInteraction) => {
    const { message } = interaction;

    const embed = EmbedBuilder.from(message.embeds[0]);
    embed
      .setColor(COLORS.ERROR)
      .setFooter({
        text: `Rejected by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      });

    if (!message.interactionMetadata) {
      throw new Error('Missing Message interactionMetadata!');
    }

    // OPTIONAL: Trigger Modal for reject reason.

    const mention = userMention(message.interactionMetadata.user.id);
    const content = `${mention} Your deposit submission has been approved!`;

    await interaction.update({
      content,
      embeds: [embed],
      components: [],
    });
  }
});
