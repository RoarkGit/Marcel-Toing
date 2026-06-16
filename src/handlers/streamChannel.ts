import type { VoiceBasedChannel } from 'discord.js'

import { CHANNEL_STATUS_MUTED, CHANNEL_STATUS_OPEN } from '../constants'
import type { MarcelToing, StreamChannelData } from '../interfaces/MarcelToing'

export const openChannel = async (
  channel: VoiceBasedChannel,
  channelData: StreamChannelData,
  bot: MarcelToing,
): Promise<void> => {
  channelData.open = true
  await Promise.all([
    ...channel.members.map((m) => m.voice.setMute(false)),
    bot.rest.put(`/channels/${channel.id}/voice-status` as `/${string}`, {
      body: { status: CHANNEL_STATUS_OPEN },
    }),
  ])
}

export const closeChannel = async (
  channel: VoiceBasedChannel,
  channelData: StreamChannelData,
  callerId: string,
  bot: MarcelToing,
): Promise<void> => {
  channelData.open = false
  channelData.allowedSpeakers.clear()
  await Promise.all([
    ...channel.members
      .filter((m) => m.id !== callerId)
      .map((m) => m.voice.setMute(true)),
    bot.rest.put(`/channels/${channel.id}/voice-status` as `/${string}`, {
      body: { status: CHANNEL_STATUS_MUTED },
    }),
  ])
}
