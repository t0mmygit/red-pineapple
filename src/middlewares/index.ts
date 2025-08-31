import { Interaction } from 'discord.js';
import { Middleware } from '../types/index.js';

export * from './isAdministrator.js';
export * from './isAuthenticated.js';

export async function runMiddleware(
  interaction: Interaction,
  middlewares: Middleware[],
): Promise<boolean> {
  for (const middleware of middlewares) {
    const result = await middleware(interaction);

    if (!result) return false;
  }

  return true;
}
