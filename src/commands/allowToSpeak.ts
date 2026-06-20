import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  GuildMember,
  MessageFlags,
} from 'discord.js'

import { isStreamMod } from '../db/streamMods'
import type { MarcelToing } from '../interfaces/MarcelToing'
import type { UserContextMenuCommand } from '../interfaces/UserContextMenuCommand'

export const allowToSpeak: UserContextMenuCommand = {
  data: new ContextMenuCommandBuilder()
    .setName('Allow to Speak')
    .setType(ApplicationCommandType.User),

  run: async (interaction, bot: MarcelToing): Promise<void> => {
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

    const isCreator = channelData.creatorId === caller.id
    const isMod = await isStreamMod(bot.db, channelData.creatorId, caller.id)

    if (!isCreator && !isMod) {
      await interaction.reply({
        content:
          'Only the channel creator or a stream mod can use this command.',
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

    await target.voice.setMute(false)
    await interaction.reply({
      content: `${target.displayName} can now speak.`,
      flags: MessageFlags.Ephemeral,
    })
  },
}
