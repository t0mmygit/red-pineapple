import { ClientEvents } from 'discord.js';

export interface EventData {
  command?: string | null,
  name?: string,
  code?: string,
  maxSubmissionCount?: number,
}

export interface Event<K extends keyof ClientEvents> {
  name: K,
  once?: boolean,
  listener: (...args: ClientEvents[K]) => Promise<void> | void,
}
