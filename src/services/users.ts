import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { NewUser, users } from '../db/schema.js';

export const insertUser = async (user: NewUser) => {
  return await db.insert(users).values(user);
};

export const selectUserById = async (id: string) => {
  return await db.query.users.findFirst({
    where: (users, { eq }) =>
      eq(users.id, id)
  });
};

export const updateUserById = async (id: string, values: Omit<NewUser, 'id'>) => {
  return await db.update(users).set(values).where(eq(users.id, id));
};
