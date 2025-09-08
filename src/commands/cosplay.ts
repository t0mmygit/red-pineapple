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
import { Event, NewSubmission, Submission } from '../db/schema.js';
import { selectEventByCommand } from '../services/events.js';
import { createTimeoutMessage } from '../utils/message.js';
import { selectUserById } from '../services/users.js';
import { UserNotFoundError } from '../utils/errors.js';

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

    const event = await selectEventByCommand(interaction.commandName);

    if (!event) {
      await createTimeoutMessage(
        interaction,
        'Submission is currently not available. Please refer to the administrator!',
      );

      return;
    };

    const isValidSubmission = await validateSubmission(interaction, event, user.id);
    if (!isValidSubmission) return;

    const submission = await insertSubmission(
      { userId: user.id, eventId: event.id } as NewSubmission
    );

    const container = await createContainer(interaction, submission);
    const component = createApprovalComponent(interaction.commandName);

    if (container) {
      await interaction.editReply({
        components: [container, component],
        flags: MessageFlags.IsComponentsV2,
      });
    } else {
      await createTimeoutMessage(
        interaction,
        'Failed to generate cosplay entry. Please contact the developer!'
      );
    }
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
): Promise<ContainerBuilder | undefined> => {
  const userId = interaction.user.id;
  const {
    characterName,
    characterSource,
    characterAttachment,
    cosplayAttachment
  } = getOptions(interaction);

  try {
    const submissionId = await getFormattedSubmissionId(submission);
    const topSection = constructUpperSection(submissionId);

    const description = await constructDescription(userId, characterName, characterSource);

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
        subtext(`${EMOJIS.INBOX_TRAY}\tSubmitted by ${userMention(userId)}`)
      );

    // TODO: Get guild and channel from Event table
    const guildId = '1289240783039234200';
    const channelId = '1409705626187337821';

    const footerSection = new SectionBuilder()
      .addTextDisplayComponents(footer)
      .setButtonAccessory(
        button => button
          .setLabel('Read rules')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/channels/${guildId}/${channelId}`)
      );

    return new ContainerBuilder()
      .setAccentColor(COLORS.INFO)
      .addSectionComponents(topSection)
      .addTextDisplayComponents(description)
      .addMediaGalleryComponents(gallery)
      .addSeparatorComponents(separator)
      .addSectionComponents(footerSection);
  } catch (error) {
    console.error(error);

    if (error instanceof UserNotFoundError) {
      await createTimeoutMessage(
        interaction,
        `Profile not found. Did you do ${inlineCode('/profile')} yet?`
      );
    }

    return;
  }
};

const validateSubmission = async (
  interaction: ChatInputCommandInteraction,
  event: Event,
  userId: string,
): Promise<boolean> => {
  const userSubmissionCount = await getSubmissionCount(userId, event.id);
  const maxSubmissionCount = event.maxSubmissionCount ?? 1;

  if (userSubmissionCount < maxSubmissionCount) {
    return true;
  }

  try {
    await createTimeoutMessage(
      interaction,
      `You are limited to ${maxSubmissionCount} submissions!`
    );

    return false;
  } catch (error) {
    console.error(error);

    return false;
  }
};

const constructUpperSection = (submissionId: string) => {
  const title = new TextDisplayBuilder()
    .setContent(
      heading(`${EMOJIS.KIMONO} New Cosplay Unveiled!`, HeadingLevel.Two)
    );

  return new SectionBuilder()
    .addTextDisplayComponents(title)
    .setButtonAccessory(
      button => button
        .setCustomId('submission-id')
        .setLabel(`#${submissionId}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );
};

const constructDescription = async (
  userId: string,
  characterName: string,
  characterSource: string
) => {
  const user = await selectUserById(userId, true);

  const fields = [
    { label: 'GrowID', value: user.username },
    { label: 'Cosplay', value: characterName },
    { label: 'Source', value: characterSource },
  ];

  const formattedList = fields.map(field =>
    `${field.label}: ${inlineCode(field.value)}`
  );

  return new TextDisplayBuilder()
    .setContent(`${bold('Description')}\n${unorderedList(formattedList)}`);
};
