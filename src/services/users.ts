import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { NewUser, User, users } from '../db/schema.js';
import { UserNotFoundError } from '../utils/errors.js';

export const insertUser = async (user: NewUser) => {
  return await db.insert(users).values(user);
};

/*
 * Select a user by ID.
 *
 * - When `enforce = true` (default): 
 *   Ensures a user is always returned. If no user is found, throws `UserNotFoundError`.
 *   Return type: `Promise<User>`
 *
 * - When `enforce = false`:
 *   Returns `null` if no user is found.
 *   Return type: `Promise<User | null>`
 */
export async function selectUserById(id: string, enforce: true): Promise<User>;
export async function selectUserById(id: string, enforce?: false): Promise<User | undefined>;
export async function selectUserById(id: string, enforce = true) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) =>
      eq(users.id, id)
  });

  if (!user && enforce) {
    throw new UserNotFoundError(id);
  }

  return user;
};

export const updateUserById = async (id: string, values: Omit<NewUser, 'id'>) => {
  return await db.update(users).set(values).where(eq(users.id, id));
};
