import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { NewSubmission, Submission, submissions } from '../db/schema.js';

export const getSubmissionCount = async (userId: string, eventId: number) => {
  return await db.$count(
    submissions,
    and(
      eq(submissions.userId, userId),
      eq(submissions.eventId, eventId)
    )
  );
};

export const insertSubmission = async (submission: NewSubmission): Promise<Submission> => {
  return db.insert(submissions).values(submission).returning().get();
};

export const getFormattedSubmissionId = async (
  submission: Submission
): Promise<string> => {
  if (!submission) {
    throw new Error('Submission not found!');
  }

  const event = await db.query.events.findFirst({
    where: (events, { eq }) =>
      eq(events.id, submission.eventId)
  });

  if (!event) {
    throw new Error('Event not found!');
  }

  const paddedId = String(submission.id).padStart(3, '0');

  return `${event.code}${paddedId}`;
};
