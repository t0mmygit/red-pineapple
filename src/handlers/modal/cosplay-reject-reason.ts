import {
  ComponentType,
  ContainerBuilder,
  MessageFlags,
  ModalSubmitInteraction,
  TextDisplayBuilder,
} from 'discord.js';
import { blockQuote, subtext, userMention } from '@discordjs/formatters';

import { COLORS, EMOJIS } from '../../utils/constant.js';
import { isAdministrator } from '../../middlewares/isAdministrator.js';
import { registerModal } from './index.js';

registerModal({
  id: 'cosplay-reject-modal',
  middlewares: [isAdministrator],
  run: async (interaction: ModalSubmitInteraction) => {
    const { message, user, fields } = interaction;

    if (!message) {
      throw new Error('Missing message reference!');
    }

    const containerComponent = message.components.find(
      (component) => component.type === ComponentType.Container
    );

    if (!containerComponent) {
      throw new Error('Missing container component!');
    }

    const footerComponent = new TextDisplayBuilder()
      .setContent(subtext(`${EMOJIS.CROSS_MARK}\tRejected by ${userMention(user.id)}`));

    const reasonComponent = new TextDisplayBuilder()
      .setContent(blockQuote(
        `${userMention(user.id)} ${fields.getTextInputValue('cosplay-reject-reason')}`)
      );

    const container = new ContainerBuilder(containerComponent.toJSON())
      .setAccentColor(COLORS.ERROR)
      .spliceComponents(-1, 1, footerComponent)
      .spliceComponents(-1, 0, reasonComponent);

    if (!interaction.isFromMessage()) {
      throw new Error('Interaction is not from message!');
    }

    await interaction.update({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }
});
