import { Middleware, MiddlewareInteraction } from '../types';

export * from './isAdministrator';


export async function runMiddleware(
  interaction: MiddlewareInteraction,
  middlewares: Middleware[],
): Promise<boolean> {
  for (const middleware of middlewares) {
    const result = await middleware(interaction);
    if (!result) {
      return false;
    }
  }

  return true;
}
