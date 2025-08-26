import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';

type BuilderReturnType =
  SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;

export interface CommandOptions {
  name: string,
  description: string,
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>,
  builder?: (builder: SlashCommandBuilder) => BuilderReturnType;
}

export const createSlashCommand = (options: CommandOptions) => {
  let builder = new SlashCommandBuilder()
    .setName(options.name)
    .setDescription(options.description);

  if (options.builder) {
    builder = options.builder(builder) as SlashCommandBuilder;
  }

  return {
    data: builder,
    execute: options.execute,
  };
};

export default createSlashCommand;
