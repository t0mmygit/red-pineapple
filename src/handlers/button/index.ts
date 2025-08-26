import { ButtonInteraction } from 'discord.js';

import { readdir } from 'fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runMiddleware } from '../../middlewares/index.js';
import { Middleware } from '../../types/index.js';

// literal string type as type check
export type ButtonId = Parameters<typeof registerButton>[0]['id'];

export interface ButtonHandler<T extends string> {
  id: T,
  middlewares: Middleware[],
  run: (interaction: ButtonInteraction) => Promise<void>;
}

const registry = new Map<ButtonId, ButtonHandler<ButtonId>>();

export function registerButton<const T extends string>(
  handler: ButtonHandler<T>): void {
  if (registry.has(handler.id)) {
    throw new Error(`Duplicate button handler ID: ${handler.id}`);
  }
  registry.set(handler.id, handler);
}

export function getButtonIds(): ButtonId[] {
  return [...registry.keys()] as ButtonId[];
}

export async function handleButton(interaction: ButtonInteraction): Promise<boolean> {
  const { customId } = interaction;

  const isKnownId = (id: string): id is ButtonId =>
    getButtonIds().includes(id as ButtonId);

  if (!isKnownId(customId)) {
    throw new Error(`Button ID ${customId} not handled!`);
  }

  const handler = registry.get(customId);
  if (!handler) {
    throw new Error(`Button ID ${customId} has missing handler!`);
  }

  try {
    const passed = await runMiddleware(interaction, handler.middlewares);
    if (!passed) return false;

    await handler.run(interaction);
    return true;
  } catch (error) {
    // TODO
    console.error(error);
    return false;
  }
}

export async function loadButtons(): Promise<boolean> {
  console.info('Loading Handlers...');

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const files = await readdir(__dirname);

  const allowedExt = process.env['NODE_ENV'] !== 'production' ? ['.ts', 'js'] : ['.js'];

  const filtered = files.filter((file) => {
    if (file === 'index.ts' || file === 'index.js') return false;
    return allowedExt.includes(extname(file));
  });

  for (const file of filtered) {
    const filePath = resolve(__dirname, file);

    await import(filePath);
  }

  return true;
}
