import { ButtonStyle, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import {
  bold,
  heading,
  inlineCode,
  subtext,
  unorderedList,
  userMention
} from '@discordjs/formatters';
import {
  ContainerBuilder,
  HeadingLevel,
  MediaGalleryBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder
} from '@discordjs/builders';

import { COLORS, EMOJIS } from '../utils/constant.js';
import createSlashCommand from '../utils/createSlashCommand.js';
import createApprovalComponent from '../utils/createApprovalComponent.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

export default createSlashCommand({
  name: 'cosplay',
  description: 'Work in progress',
  middlewares: [isAuthenticated],
  builder: (builder) =>
    builder
      .addStringOption(option =>
        option.setName('character-name')
          .setDescription('Character')
          .setRequired(true)
      ).addStringOption(option =>
        option.setName('character-source')
          .setDescription('Source')
          .setRequired(true)
      ).addAttachmentOption(option =>
        option.setName('character-cosplay')
          .setDescription('In-game character cosplay')
          .setRequired(true)
      ).addAttachmentOption(option =>
        option.setName('origin-character')
          .setDescription('The original character you\'re cosplaying')
          .setRequired(true)
      ),
  execute: async (interaction) => {
    await interaction.deferReply();

    const container = createContainer(interaction);
    const component = createApprovalComponent(interaction.commandName);

    await interaction.editReply({
      components: [container, component],
      flags: MessageFlags.IsComponentsV2,
    });
  }
});

function createContainer(interaction: ChatInputCommandInteraction): ContainerBuilder {
  const { options, user } = interaction;

  const characterName = options.getString('character-name');
  if (!characterName) {
    throw new Error('Missing string: character-name');
  }

  const characterSource = options.getString('character-source');
  if (!characterSource) {
    throw new Error('Missing string: character-source');
  }

  const cosplayAttachment = options.getAttachment('character-cosplay');
  if (!cosplayAttachment?.url) {
    throw new Error('Missing attachment: character-cosplay');
  }

  const characterAttachment = options.getAttachment('origin-character');
  if (!characterAttachment?.url) {
    throw new Error('Missing attachment: origin-character');
  }

  // Container Components
  const title = new TextDisplayBuilder()
    .setContent(heading(`${EMOJIS.SPARKLES} New Cosplay Unveiled!`, HeadingLevel.Two));

  const fields = [
    { label: 'GrowID', value: user.username },
    { label: 'Cosplay', value: characterName },
    { label: 'Source', value: characterSource },
  ];

  const formattedList = fields.map(field =>
    `${field.label}: ${inlineCode(field.value)}`
  );

  const description = new TextDisplayBuilder()
    .setContent(`${bold('Description')}\n${unorderedList(formattedList)}`);

  const gallery = new MediaGalleryBuilder()
    .addItems(
      item => item
        .setDescription('character-cosplay')
        .setURL(cosplayAttachment.url),
      item => item
        .setDescription('origin-character')
        .setURL(characterAttachment.url)
    );

  const separator = new SeparatorBuilder();

  const footer = new TextDisplayBuilder()
    .setContent(
      subtext(`${EMOJIS.INBOX_TRAY}\tSubmitted by ${userMention(user.id)}`)
    );
  const footerSection = new SectionBuilder()
    .addTextDisplayComponents(footer)
    .setButtonAccessory(
      button => button
        .setLabel('Read rules')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/channels/1102601261473345677/1102601261473345680')
    );

  return new ContainerBuilder()
    .setAccentColor(COLORS.INFO)
    .addTextDisplayComponents(title)
    .addTextDisplayComponents(description)
    .addMediaGalleryComponents(gallery)
    .addSeparatorComponents(separator)
    .addSectionComponents(footerSection);
}
