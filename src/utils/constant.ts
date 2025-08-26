import { Colors } from 'discord.js';

export const EMOJIS = {
  ART: '🎨',
  MONEY_WITH_WINGS: '💸',
  WHITE_CHECK_MARK: '✅',
  CROSS_MARK: '❌',
  SPARKLES: '✨',
  INBOX_TRAY: '📥',
} as const;

export const COLORS = {
  SUCCESS: Colors.Green,
  ERROR: Colors.Red,
  WARNING: Colors.Yellow,
  INFO: Colors.Blurple,
} as const;
