import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  GuildMember,
  MessageFlags,
} from 'discord.js'

import type { MarcelToing } from '../interfaces/MarcelToing'
import type { UserContextMenuCommand } from '../interfaces/UserContextMenuCommand'

export const revokeSpeaking: UserContextMenuCommand = {
  data: new ContextMenuCommandBuilder()
    .setName('Revoke Speaking')
    .setType(ApplicationCommandType.User),

  run: async (interaction, bot: MarcelToing): Promise<void> => {
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

    const target = interaction.targetMember
    if (!(target instanceof GuildMember)) {
      await interaction.reply({
        content: 'Could not find that user.',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    await target.voice.setMute(true)
    await interaction.reply({
      content: `${target.displayName}'s speak permission has been revoked.`,
      flags: MessageFlags.Ephemeral,
    })
  },
}
