import { EmbedBuilder } from '@discordjs/builders';
import { blockQuote, inlineCode, userMention } from '@discordjs/formatters';
import { ChatInputCommandInteraction } from 'discord.js';

import createSlashCommand from '../utils/createSlashCommand.js';
import createApprovalComponent from '../utils/createApprovalComponent.js';
import { COLORS, EMOJIS } from '../utils/constant.js';

export default createSlashCommand({
  name: 'submit-deposit',
  description: 'Submit your competition/event deposit',
  builder: (builder) =>
    builder
      .addStringOption(option =>
        option.setName('growid')
          .setDescription('In-Game Username')
          .setRequired(true)
      )
      .addAttachmentOption(option =>
        option.setName('proof-of-deposit')
          .setDescription('In-game proof of deposit')
          .setRequired(true)
      ).addStringOption(option =>
        option.setName('terms-and-condition')
          .setDescription('Have you read and agree to the rules? (Yes/No)')
          .setRequired(true)
          .setChoices(
            { name: 'Yes', value: 'yes' },
            { name: 'No', value: 'no' }
          )
      ),
  execute: async (interaction) => {
    await interaction.deferReply();

    const embed = await createEmbed(interaction);
    if (!embed) return;

    const component = createApprovalComponent(interaction.commandName);

    const username = userMention(interaction.user.id);

    await interaction.editReply({
      content: `${username} Please wait for approval!`,
      embeds: [embed],
      components: [component],
    });
  }
});

async function createEmbed(
  interaction: ChatInputCommandInteraction
): Promise<EmbedBuilder | undefined> {
  const { options } = interaction;

  const condition = options.getString('terms-and-condition');
  if (condition?.includes('no')) {
    const message = await interaction.editReply({
      content: `${userMention(interaction.user.id)} Please read the rules first.`
    });
    setTimeout(async () => await message.delete(), 10000);

    return;
  }

  const username = options.getString('growid');
  const attachment = options.getAttachment('proof-of-deposit');

  // TODO: Store event name in database.
  const event = `${EMOJIS.ART} Art Build Battle`;
  const title = `${EMOJIS.MONEY_WITH_WINGS} New Deposit Submission`;

  const rules = blockQuote('I acknowledge that I have read and agree to the rules.');

  if (!username) {
    throw new Error('GrowID is required!');
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.WARNING)
    .setTitle(title)
    .setDescription(`GrowID: ${inlineCode(username)}\nEvent: ${inlineCode(event)}\n${rules}`)
    .setFooter({ text: 'Status: Waiting approval', iconURL: interaction.user.displayAvatarURL() });

  if (attachment?.url) {
    embed.setImage(attachment.url);
  }

  embed.addFields(
    { name: 'Submitted At', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
  );

  return embed;
}
