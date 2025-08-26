import {
  ButtonInteraction,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
  TextDisplayBuilder
} from 'discord.js';
import { subtext, userMention } from '@discordjs/formatters';

import { registerButton } from './index.js';
import { COLORS, EMOJIS } from '../../utils/constant.js';
import { isAdministrator } from '../../middlewares/index.js';

registerButton({
  id: 'cosplay:approve',
  middlewares: [isAdministrator],
  run: async (interaction: ButtonInteraction) => {
    const { message, user } = interaction;

    const containerComponent = message.components.find(
      (component) => component.type === ComponentType.Container
    );

    if (!containerComponent) {
      throw new Error('Missing container component!');
    }
    const containerBuilder = new ContainerBuilder(containerComponent.toJSON());

    const footerComponent = new TextDisplayBuilder()
      .setContent(subtext(`${EMOJIS.WHITE_CHECK_MARK}\tApproved by ${userMention(user.id)}`));

    containerBuilder
      .setAccentColor(COLORS.SUCCESS)
      .spliceComponents(-1, 1, footerComponent);

    await interaction.update({
      components: [containerBuilder],
      flags: MessageFlags.IsComponentsV2,
    });
  }
});
