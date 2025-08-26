import { ButtonInteraction, EmbedBuilder, userMention } from 'discord.js';
import { registerButton } from './index.js';
import { COLORS } from '../../utils/constant.js';
import { isAdministrator } from '../../middlewares/isAdministrator.js';

registerButton({
  id: 'approve',
  middlewares: [isAdministrator],
  run: async (interaction: ButtonInteraction) => {
    const { message, user } = interaction;

    if (!message.embeds[0]) {
      throw new Error('Missing embeds!');
    }

    const embed = EmbedBuilder.from(message.embeds[0])
      .setColor(COLORS.SUCCESS)
      .setFooter({
        text: `Approved by ${user.username}`,
        iconURL: user.displayAvatarURL()
      });

    if (!message.interactionMetadata) {
      throw new Error('Missing message interactionMetadata!');
    }

    const mention = userMention(message.interactionMetadata.user.id);
    const content = `${mention} Your deposit submission has been approved!`;

    try {
      await interaction.update({
        content,
        embeds: [embed],
        components: [],
      });
    } catch (error) {
      // TODO
      console.error(error);
    }
  }
});
