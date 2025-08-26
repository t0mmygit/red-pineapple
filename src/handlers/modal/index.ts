import { ModalSubmitInteraction } from 'discord.js';

import { readdir } from 'fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Middleware } from '../../types/index.js';
import { runMiddleware } from '../../middlewares/index.js';


export interface ModalHandler {
  id: string,
  middlewares: Middleware[],
  run: (interaction: ModalSubmitInteraction) => Promise<void>,
}

export type ModalId = Parameters<typeof registerModal>[0]['id'];

const registry = new Map<ModalId, ModalHandler>();

export function registerModal(handler: ModalHandler) {
  if (registry.has(handler.id)) {
    throw new Error(`Duplicate modal handler ID: ${handler.id}`);
  }
  registry.set(handler.id, handler);
}

export function getModalIds(): ModalId[] {
  return [...registry.keys()] as ModalId[];
}

export async function handleModal(interaction: ModalSubmitInteraction) {
  const { customId } = interaction;

  const isKnownId = (id: string): id is ModalId =>
    getModalIds().includes(id as ModalId);

  if (!isKnownId) {
    throw new Error(`Modal ID ${customId} not handled`);
  }

  const handler = registry.get(customId);
  if (!handler) {
    throw new Error(`Modal ID ${customId} has missing handler!`);
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

export async function loadModals(): Promise<boolean> {
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
