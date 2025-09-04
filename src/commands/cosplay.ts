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
import {
  getFormattedSubmissionId,
  getSubmissionCount,
  insertSubmission
} from '../services/submissions.js';
import { NewSubmission, Submission } from '../db/schema.js';
import { selectEventByNameOrCode } from '../services/events.js';
import { createTimeoutMessage } from '../utils/message.js';

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
    const { user } = interaction;

    const eventNameOrCode = 'Cosplay';

    const event = await selectEventByNameOrCode(eventNameOrCode);
    if (!event) {
      await createTimeoutMessage(
        interaction,
        'Submission is currently not available. Please refer to the administrator!',
      );

      return;
    };

    const isValidSubmission = await validateSubmission(interaction, user.id, event.id);
    if (!isValidSubmission) return;

    const submission = await insertSubmission(
      { userId: user.id, eventId: event.id } as NewSubmission
    );

    const container = await createContainer(interaction, submission);
    const component = createApprovalComponent(interaction.commandName);

    await interaction.editReply({
      components: [container, component],
      flags: MessageFlags.IsComponentsV2,
    });
  }
});

const getOptions = (interaction: ChatInputCommandInteraction) => {
  const { options } = interaction;

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

  return {
    characterName,
    characterSource,
    cosplayAttachment,
    characterAttachment,
  };
};

const createContainer = async (
  interaction: ChatInputCommandInteraction,
  submission: Submission,
): Promise<ContainerBuilder> => {
  const { user } = interaction;
  const {
    characterName,
    characterSource,
    characterAttachment,
    cosplayAttachment
  } = getOptions(interaction);

  // Container Components
  const submissionId = await getFormattedSubmissionId(submission);
  const title = new TextDisplayBuilder()
    .setContent(
      heading(`${EMOJIS.SPARKLES} New Cosplay Unveiled!`, HeadingLevel.Two)
    );
  const topSection = new SectionBuilder()
    .addTextDisplayComponents(title)
    .setButtonAccessory(
      button => button
        .setCustomId('submission-id')
        .setLabel(`#${submissionId}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

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
    .addSectionComponents(topSection)
    .addTextDisplayComponents(description)
    .addMediaGalleryComponents(gallery)
    .addSeparatorComponents(separator)
    .addSectionComponents(footerSection);
};

const validateSubmission = async (
  interaction: ChatInputCommandInteraction,
  userId: string,
  eventId: number
): Promise<boolean> => {
  const userSubmissionCount = await getSubmissionCount(userId, eventId);
  const maxSubmission = 1;

  if (userSubmissionCount < maxSubmission) {
    return true;
  }

  try {
    await createTimeoutMessage(
      interaction,
      `You are limited to ${maxSubmission} submissions!`
    );

    return false;
  } catch (error) {
    console.error(error);

    return false;
  }
};
