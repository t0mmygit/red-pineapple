import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  Interaction,
  InteractionCallbackResponse,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { inlineCode, userMention } from '@discordjs/formatters';

import { isAdministrator } from '../middlewares/isAdministrator.js';
import createSlashCommand from '../utils/createSlashCommand.js';
import { insertEvent } from '../services/events.js';
import { NewEvent } from '../db/schema.js';
import { commandNameList } from '../utils/helper.js';
import { COLLECTOR_TIME } from '../utils/constant.js';

export default createSlashCommand({
  name: 'create-event',
  description: 'Create an event',
  middlewares: [isAdministrator],
  builder: (builder) =>
    builder
      .addStringOption(option =>
        option
          .setName('event-name')
          .setDescription('The event\'s name (max length: 256 characters)')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('event-code')
          .setDescription('The event\'s code (e.g. C - Cosplay; Submission C001)')
          .setRequired(true)
      )
      .addIntegerOption(option =>
        option
          .setName('max-submission-count')
          .setDescription('How many submission per user?')
      ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    try {
      const component = await createStringMenuSelection();

      const response = await interaction.reply({
        components: [component],
        withResponse: true,
      });

      const command = await getStringMenuCommandSelection(response, interaction);

      // TODO: Handle empty selection
      if (!command) return;

      const { options } = interaction;
      const name = options.getString('event-name', true);
      const code = options.getString('event-code', true);
      const maxSubmissionCount = options.getInteger('max-submission-count');

      const newEvent: NewEvent = { name, code, command, maxSubmissionCount };
      await insertEvent(newEvent);

      const mention = userMention(interaction.user.id);
      const formattedEventName = inlineCode(name);

      await interaction.editReply({
        content: `${mention} You've successfully created ${formattedEventName} event.`,
        components: [],
      });
    } catch (error) {
      console.error(error);

      // TODO: Maybe log it to a channel
      // Handle SQLite Error with Wrapper
    }
  }
});

const getStringMenuCommandSelection = async (
  response: InteractionCallbackResponse,
  interaction: ChatInputCommandInteraction
): Promise<string | undefined> => {
  const collectorFilter = (i: Interaction) => i.user.id === interaction.user.id;

  try {
    const message = response.resource?.message;

    if (!message) {
      throw new Error('No message found in the response resource.');
    }

    const confirmation = await message.awaitMessageComponent({
      filter: collectorFilter,
      componentType: ComponentType.StringSelect,
      time: COLLECTOR_TIME,
    });

    return confirmation.values[0];
  } catch (error) {
    // TODO: Handle timeout
    console.error(error);

    return;
  }
};

const createStringMenuSelection = async () => {
  const commandNames = await commandNameList();

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('command-selection-menu')
      .setPlaceholder('Select a command')
      .setOptions(
        commandNames.map(commandName => {
          return new StringSelectMenuOptionBuilder()
            .setLabel(commandName)
            .setValue(commandName);
        })
      )
  );
};
