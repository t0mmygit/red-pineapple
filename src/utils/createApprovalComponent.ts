import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EMOJIS } from './constant.js';

export default function createApprovalComponent(
  type: string,
  approveLabel = 'Approve',
  rejectLabel = 'Reject',
): ActionRowBuilder<ButtonBuilder> {
  const approve = new ButtonBuilder()
    .setCustomId(`${type}:${approveLabel.toLowerCase()}`)
    .setLabel(approveLabel)
    .setEmoji({ name: EMOJIS.WHITE_CHECK_MARK })
    .setStyle(ButtonStyle.Success);

  const reject = new ButtonBuilder()
    .setCustomId(`${type}:${rejectLabel.toLowerCase()}`)
    .setLabel(rejectLabel)
    .setEmoji({ name: EMOJIS.CROSS_MARK })
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(approve, reject);
};
