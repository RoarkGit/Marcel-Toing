import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js'

import { BUTTON_REQUEST_SPEAK } from '../constants'
import type { Command } from '../interfaces/Command'
import type { MarcelToing } from '../interfaces/MarcelToing'

export const speak: Command = {
  data: new SlashCommandBuilder()
    .setName('speak')
    .setDescription('Request to speak in the current stream channel.'),

  run: async (
    interaction: ChatInputCommandInteraction,
    bot: MarcelToing,
  ): Promise<void> => {
    const caller = interaction.member
    if (!(caller instanceof GuildMember)) return

    const voiceChannelId = caller.voice.channelId
    const channelData = voiceChannelId
      ? bot.state.activeStreamChannels.get(voiceChannelId)
      : undefined

    if (!channelData) {
      await interaction.reply({
        content: 'You must be in an active stream channel to use this command.',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    if (!caller.voice.serverMute) {
      await interaction.reply({
        content: "You're not muted, you can already speak!",
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(BUTTON_REQUEST_SPEAK)
        .setLabel('Request to Speak')
        .setStyle(ButtonStyle.Primary),
    )

    await interaction.reply({
      content:
        '🎙️ Want to speak? Request permission from the channel creator.',
      components: [row],
      flags: MessageFlags.Ephemeral,
    })
  },
}
