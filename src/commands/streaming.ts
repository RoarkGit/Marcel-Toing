import {
  type ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js'

import { closeChannel, openChannel } from '../handlers/streamChannel'
import type { Command } from '../interfaces/Command'
import type { MarcelToing } from '../interfaces/MarcelToing'

export const streaming: Command = {
  data: new SlashCommandBuilder()
    .setName('streaming')
    .setDescription('Manage voice permissions in your stream channel.')
    .addSubcommand((sub) =>
      sub
        .setName('open')
        .setDescription('Allow everyone in the channel to speak.'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('close')
        .setDescription('Restore the default: only you can speak.'),
    ),

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

    if (!channelData || channelData.creatorId !== caller.id) {
      await interaction.reply({
        content:
          'You must be the creator of an active stream channel to use this command.',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    const channel = await bot.channels.fetch(voiceChannelId!)
    if (!channel?.isVoiceBased()) return

    const sub = interaction.options.getSubcommand()

    if (sub === 'open') {
      await openChannel(channel, channelData, bot)
      await interaction.reply({
        content: 'Everyone in the channel can now speak.',
        flags: MessageFlags.Ephemeral,
      })
    } else if (sub === 'close') {
      await closeChannel(channel, channelData, caller.id, bot)
      await interaction.reply({
        content: 'Channel closed — only you can speak.',
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
