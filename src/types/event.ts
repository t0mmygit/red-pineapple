import { ClientEvents } from 'discord.js';

export interface Event<K extends keyof ClientEvents> {
  name: K,
  once?: boolean,
  listener: (...args: ClientEvents[K]) => Promise<void> | void,
}
