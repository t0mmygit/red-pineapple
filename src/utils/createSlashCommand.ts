import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import { Command } from '../types/command.js';
import { Middleware } from '../types/middleware.js';

type BuilderReturnType =
  SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;

export interface CommandOptions {
  name: string,
  description: string,
  middlewares: Middleware[],
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>,
  builder?: (builder: SlashCommandBuilder) => BuilderReturnType;
}

export const createSlashCommand = (options: CommandOptions): Command => {
  let builder = new SlashCommandBuilder()
    .setName(options.name)
    .setDescription(options.description);

  if (options.builder) {
    builder = options.builder(builder) as SlashCommandBuilder;
  }

  return {
    data: builder,
    middlewares: options.middlewares,
    execute: options.execute,
  };
};

export default createSlashCommand;
