import {
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { isAdministrator } from '../middlewares/isAdministrator.js';
import createSlashCommand from '../utils/createSlashCommand.js';
import { commandNameList } from '../utils/helper.js';
import { selectEventByNameOrCode, selectEvents, updateEventByName } from '../services/events.js';
import { createTimeoutMessage, sendUserMentionMessage } from '../utils/message.js';
import { EventData } from '../types/event.js';

export default createSlashCommand({
  name: 'update-event',
  description: 'Update an event',
  middlewares: [isAdministrator],
  builder: (builder) =>
    builder
      .addStringOption(option =>
        option
          .setName('target-event')
          .setDescription('Which event to update?')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName('event-name')
          .setDescription('The event\'s name (max length: 256 characters)')
      )
      .addStringOption(option =>
        option
          .setName('event-code')
          .setDescription('The event\'s code (e.g. C - Cosplay; Submission C001)')
      )
      .addIntegerOption(option =>
        option
          .setName('max-submission-count')
          .setDescription('How many submission per user?')
      )
      .addStringOption(option =>
        option
          .setName('set-event-command')
          .setDescription('Please refer to the developer.')
          .setAutocomplete(true)
      ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const { options } = interaction;
    console.info('All the options: ', options);
    const eventName = options.getString('event-name');
    const eventCode = options.getString('event-code');
    const maxSubmissionCount = options.getInteger('max-submission-count');

    const newEventValue: EventData = {};

    try {
      const event = await selectEventByNameOrCode(options.getString('target-event', true));
      if (!event) {
        console.log('Event not found');
        await createTimeoutMessage(
          interaction,
          'The targeted event does not exist!',
        );

        return;
      }

      newEventValue.command = event.command;

      if (!eventName && !eventCode && !maxSubmissionCount) {
        console.info('No changes!');
        await createTimeoutMessage(
          interaction,
          'No changes has been made.'
        );

        return;
      }

      if (eventName) { newEventValue.name = eventName; }
      if (eventCode) { newEventValue.code = eventCode; }
      if (maxSubmissionCount) { newEventValue.maxSubmissionCount = maxSubmissionCount; }

      const result = await updateEventByName(event.name, newEventValue);
      if (!result) {
        await createTimeoutMessage(
          interaction,
          'Update operation failed! Please contact the developer.'
        );

        return;
      }

      await sendUserMentionMessage(
        interaction,
        interaction.user.id,
        'Update successfully!'
      );
    } catch (error) {
      // TODO: Error handler
      console.error(error);
    }
  },
  autocomplete: async (interaction: AutocompleteInteraction) => {
    const focused = interaction.options.getFocused(true);
    const focusedName = focused.name;

    if (focusedName !== 'target-event' && focusedName !== 'set-event-command') return;

    try {
      switch (focusedName) {
        case 'target-event':
          await targetEventAutocomplete(focused, interaction);
          break;
        case 'set-event-command':
          await setEventCommandAutocomplete(focused, interaction);
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }
});

const targetEventAutocomplete = async (
  focused: AutocompleteFocusedOption,
  interaction: AutocompleteInteraction
) => {
  // TODO: Optimize data performance by caching or store by memory?
  const events = await selectEvents();

  const choices = events
    .map(event =>
    (
      {
        name: event.name,
        value: event.name
      }
    ))
    .filter(choice => {
      const searchTerm = focused.value.trim().toLowerCase();
      return choice.name.toLowerCase().includes(searchTerm);
    })
    .slice(0, 5);

  await interaction.respond(choices);
};

const setEventCommandAutocomplete = async (
  focused: AutocompleteFocusedOption,
  interaction: AutocompleteInteraction
) => {
  // TODO: Optimize data performance by caching or store by memory?
  const commands = await commandNameList();

  const choices = commands
    .map(command =>
    (
      {
        name: command,
        value: command,
      }
    ))
    .filter(choice => {
      const searchTerm = focused.value.trim().toLowerCase();
      return choice.name.toLowerCase().includes(searchTerm);
    })
    .slice(0, 5);

  await interaction.respond(choices);
};
