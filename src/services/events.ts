import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events, NewEvent } from '../db/schema.js';
import { EventData } from '../types/event.js';

export const selectEventByNameOrCode = async (target: string) => {
  return await db.query.events.findFirst({
    where: (events, { or, eq }) =>
      or(
        eq(events.name, target),
        eq(events.code, target)
      )
  });
};

export const selectEventByCommand = async (target: string) => {
  return await db.query.events.findFirst({
    where: (events, { eq }) =>
      eq(events.command, target)
  });
};

export const selectEvents = async () => {
  return await db.query.events.findMany();
};

export const insertEvent = async (event: NewEvent) => {
  return await db.insert(events).values(event);
};

export const updateEventByName = async (name: string, values: EventData) => {
  return await db.update(events).set(values).where(eq(events.name, name));
};

export const getEventRating = async (target: string): Promise<number | null> => {
  const event = await selectEventByNameOrCode(target);

  return event.rating;
};
