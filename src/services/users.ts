import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { NewUser, users } from '../db/schema.js';
import { UserNotFoundError } from '../utils/errors.js';

export const insertUser = async (user: NewUser) => {
  return await db.insert(users).values(user);
};

export const selectUserById = async (id: string, enforce = true) => {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) =>
      eq(users.id, id)
  });

  if (!user && enforce) throw new UserNotFoundError(id);

  return user;
};

export const updateUserById = async (id: string, values: Omit<NewUser, 'id'>) => {
  return await db.update(users).set(values).where(eq(users.id, id));
};
