import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
  RestOrArray,
  TextDisplayBuilder
} from 'discord.js';
import { subtext, userMention } from '@discordjs/formatters';

import { registerButton } from './index.js';
import { COLORS, EMOJIS } from '../../utils/constant.js';
import { isAdministrator } from '../../middlewares/index.js';
import { selectEventByCommand } from '../../services/events.js';

registerButton({
  id: 'cosplay:approve',
  middlewares: [isAdministrator],
  run: async (interaction: ButtonInteraction) => {
    const { message, user, customId } = interaction;

    const containerComponent = message.components.find(
      (component) => component.type === ComponentType.Container
    );

    if (!containerComponent) {
      throw new Error('Missing container component!');
    }
    const newContainer = new ContainerBuilder(containerComponent.toJSON());

    const footerComponent = new TextDisplayBuilder()
      .setContent(subtext(`${EMOJIS.WHITE_CHECK_MARK}\tApproved by ${userMention(user.id)}`));

    newContainer
      .setAccentColor(COLORS.SUCCESS)
      .spliceComponents(-1, 1, footerComponent);

    const commandName = getCommandNameFromCustomId(customId);

    if (!commandName) throw new Error('Failed to generate button: missing command name');
    const ratingButtons = await createRatingButtons(commandName);

    const actionComponent = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(...ratingButtons);

    await interaction.update({
      components: [newContainer, actionComponent],
      flags: MessageFlags.IsComponentsV2,
    });
  }
});

const getCommandNameFromCustomId = (customId: string): string | undefined => {
  const split = customId.split(':');

  if (!split[0]) return;

  return split[0];
};

const createRatingButtons = async (commandName: string) => {
  const event = await selectEventByCommand(commandName);
  const rating = event?.rating;

  if (!event)
    throw new Error('Failed to generate rating buttons: command could not be found.');
  if (!rating)
    throw new Error('Failed to generate rating button: missing rating definition.');
  if (rating < 3)
    throw new Error('Failed to generate rating buttons: event rating must be more than 3.');

  const buttons: RestOrArray<ButtonBuilder> = [];

  for (let i = 1; i <= rating; i++) {
    const button = new ButtonBuilder()
      .setCustomId(`${commandName}:rating:${i}`)
      .setLabel(`${i} ${EMOJIS.STAR}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);;

    buttons.push(button);
  }

  return buttons;
};
