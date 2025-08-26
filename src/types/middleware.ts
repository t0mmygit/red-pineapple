import { Interaction } from 'discord.js';

export type Middleware = (
  interaction: Interaction
) => Promise<boolean> | boolean;
