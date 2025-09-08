import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import { Middleware } from './middleware.js';

export interface Command {
  data: SlashCommandBuilder,
  middlewares: Middleware[],
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>,
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>
}
