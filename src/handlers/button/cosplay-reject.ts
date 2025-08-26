import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';

import { registerButton } from './index.js';
import { isAdministrator } from '../../middlewares/isAdministrator.js';

registerButton({
  id: 'cosplay:reject',
  middlewares: [isAdministrator],
  run: async (interaction: ButtonInteraction) => {
    console.log('Showing Modal...');

    const reasonComponent = new TextInputBuilder()
      .setCustomId('cosplay-reject-reason')
      .setLabel('Please state the reason')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const component = new ActionRowBuilder<TextInputBuilder>()
      .addComponents(reasonComponent);

    const modal = new ModalBuilder()
      .setCustomId('cosplay-reject-modal')
      .setTitle('Rejection Prompt')
      .setComponents(component);

    await interaction.showModal(modal);
  }
});
