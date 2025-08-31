import { Interaction } from 'discord.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

export const isAuthenticated = async (
  interaction: Interaction
): Promise<boolean> => {
  const discordId = interaction.user.id;

  const user = await db.query.users.findFirst({
    where: (users, { eq }) =>
      eq(users.id, discordId)
  });

  // TODO: Temporary solution, doesn't look like user authentication.
  if (!user) {
    await db.insert(users).values({ id: discordId });
  }

  console.info('isAuthenticated: ', user);

  return true;
};
