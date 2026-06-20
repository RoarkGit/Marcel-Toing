import type { VoiceBasedChannel } from 'discord.js'

import { CHANNEL_STATUS_MUTED, CHANNEL_STATUS_OPEN } from '../constants'
import { updateStreamOpenState } from '../db/activeStreams'
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
    updateStreamOpenState(bot.db, channel.id, true, []),
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
  const membersToMute = channel.members.filter((m) => m.id !== callerId)
  const mutedIds = membersToMute.map((m) => m.id)
  await Promise.all([
    ...membersToMute.map((m) => m.voice.setMute(true)),
    bot.rest.put(`/channels/${channel.id}/voice-status` as `/${string}`, {
      body: { status: CHANNEL_STATUS_MUTED },
    }),
    updateStreamOpenState(bot.db, channel.id, false, mutedIds),
  ])
}
