import { ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js';

export type Middleware = (
  interaction: ChatInputCommandInteraction | ButtonInteraction
) => Promise<boolean> | boolean;

export type MiddlewareInteraction
  = ChatInputCommandInteraction | ButtonInteraction | ModalSubmitInteraction;
