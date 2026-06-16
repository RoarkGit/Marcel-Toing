import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  type VoiceState,
} from 'discord.js'

import {
  BUTTON_CLOSE_CHANNEL,
  BUTTON_OPEN_CHANNEL,
  BUTTON_REQUEST_SPEAK,
  CHANNEL_STATUS_MUTED,
} from '../constants'
import type { MarcelToing } from '../interfaces/MarcelToing'

export const voiceStateUpdate = async (
  oldState: VoiceState,
  newState: VoiceState,
  bot: MarcelToing,
): Promise<void> => {
  const { streamingLobbyId } = bot.config
  const member = newState.member ?? oldState.member
  if (!member) return

  const oldChannelId = oldState.channelId
  const newChannelId = newState.channelId
  const movedChannels = oldChannelId !== newChannelId

  // Someone joined the lobby — spin up their channel and move them in.
  if (newChannelId === streamingLobbyId) {
    const lobbyChannel = await bot.channels.fetch(streamingLobbyId)
    if (!lobbyChannel?.isVoiceBased()) return

    const streamChannel = await newState.guild.channels.create({
      name: `${member.displayName}'s Stream`,
      type: ChannelType.GuildVoice,
      parent: lobbyChannel.parentId,
    })

    bot.state.activeStreamChannels.set(streamChannel.id, {
      creatorId: member.id,
      open: false,
    })

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(BUTTON_REQUEST_SPEAK)
        .setLabel('Request to Speak')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(BUTTON_OPEN_CHANNEL)
        .setLabel('Open')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(BUTTON_CLOSE_CHANNEL)
        .setLabel('Close')
        .setStyle(ButtonStyle.Danger),
    )

    await Promise.all([
      member.voice.setChannel(streamChannel),
      bot.rest.put(
        `/channels/${streamChannel.id}/voice-status` as `/${string}`,
        {
          body: { status: CHANNEL_STATUS_MUTED },
        },
      ),
      streamChannel.send({
        content:
          '🎙️ Want to speak? Request permission from the channel creator.',
        components: [row],
      }),
    ])
    return
  }

  // Someone joined a tracked stream channel — mute them unless they're the
  // creator or the channel is open.
  if (movedChannels && newChannelId) {
    const channelData = bot.state.activeStreamChannels.get(newChannelId)
    if (
      channelData &&
      member.id !== channelData.creatorId &&
      !channelData.open
    ) {
      await member.voice.setMute(true)
    }
  }

  // Someone left a tracked stream channel.
  if (movedChannels && oldChannelId) {
    const channelData = bot.state.activeStreamChannels.get(oldChannelId)
    if (!channelData) return

    // Clear the server mute so it doesn't follow them to other channels.
    await member.voice.setMute(false).catch(() => undefined)

    const oldChannel = oldState.channel
    if (oldChannel && oldChannel.members.size === 0) {
      bot.state.activeStreamChannels.delete(oldChannelId)
      await oldChannel.delete()
    }
  }
}
