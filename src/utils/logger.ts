import {
  APIEmbedField,
  Client, EmbedBuilder,
  RestOrArray,
  TextChannel
} from 'discord.js';
import { inlineCode, userMention } from '@discordjs/formatters';

import 'dotenv/config';
import { COLORS } from './constant.js';

type FieldType = RestOrArray<APIEmbedField>;

let logChannel: TextChannel | null = null;

interface Metadata {
  user?: string,
  userId?: string,
  target?: string,
}

export async function setupLogger(client: Client, logChannelId: string): Promise<void> {
  const GUILD_ID = process.env['GUILD_ID'];

  if (!GUILD_ID) {
    throw new Error('Missing GUILD_ID environment variable!');
  }

  if (!client.user) {
    throw new Error('Missing client user!');
  }

  const embed = new EmbedBuilder()
    .setTitle('Kessoku Band')
    .setDescription(`${userMention(client.user.id)} has arrived!`)
    .setTimestamp();

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    throw new Error('No guild available!');
  }

  const channel = await guild.channels.fetch(logChannelId);
  if (channel?.isTextBased() && channel.type === 0) {
    logChannel = channel as TextChannel;
  } else {
    throw new Error('Log Channel not found or not a text channel!');
  }

  await logChannel.send({ embeds: [embed] });
}

export async function logEvent(
  title: string,
  description: string,
  guild: string,
  metadata?: Metadata,
  color: number = COLORS.INFO
): Promise<void> {
  if (!logChannel) {
    throw new Error('Log Channel not found or not initialized!');
  }

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp()
    .setFields({ name: 'Guild', value: inlineCode(guild), inline: true });

  if (metadata) {
    const fields: FieldType = [];

    if (metadata.user) fields.push({ name: 'User', value: metadata.user, inline: true });
    if (metadata.userId) fields.push({ name: 'User ID', value: metadata.userId, inline: true });
    if (metadata.target) fields.push({ name: 'Target', value: metadata.target });

    embed.addFields(fields);
  }

  try {
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
  }
}
