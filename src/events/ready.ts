import type { ActiveStreamDoc } from '../db/activeStreams'
import {
  getAllActiveStreams,
  removeActiveStream,
  removeMutedUser,
} from '../db/activeStreams'
import type { MarcelToing } from '../interfaces/MarcelToing'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const BOT_STATE_COLLECTION = 'botState'

const restoreOrCleanupStream = async (
  bot: MarcelToing,
  stream: ActiveStreamDoc,
): Promise<void> => {
  const guild = await bot.guilds.fetch(stream.guildId).catch(() => null)
  if (!guild) {
    await removeActiveStream(bot.db, stream.voiceChannelId)
    return
  }

  const voiceChannel = await bot.channels
    .fetch(stream.voiceChannelId)
    .catch(() => null)

  if (!voiceChannel?.isVoiceBased() || voiceChannel.members.size === 0) {
    await cleanupStream(bot, stream, voiceChannel)
    return
  }

  // Restore in-memory state.
  const allowedSpeakers = new Set(stream.allowedSpeakerIds)

  bot.state.activeStreamChannels.set(stream.voiceChannelId, {
    creatorId: stream.creatorId,
    open: stream.open,
    allowedSpeakers,
    categoryId: stream.categoryId,
    controlsChannelId: stream.controlsChannelId,
  })
  bot.state.controlsToVoiceChannel.set(
    stream.controlsChannelId,
    stream.voiceChannelId,
  )

  // Unmute anyone who was muted but is no longer in the channel.
  const members = await guild.members.fetch()
  for (const userId of stream.mutedUserIds) {
    const member = members.get(userId)
    if (!member || member.voice.channelId !== stream.voiceChannelId) {
      await member?.voice.setMute(false).catch(() => undefined)
      await removeMutedUser(bot.db, stream.voiceChannelId, userId)
    }
  }

  console.log(
    `Restored stream channel for ${stream.creatorId} (${stream.open ? 'open' : 'closed'})`,
  )
}

const cleanupStream = async (
  bot: MarcelToing,
  stream: ActiveStreamDoc,
  voiceChannel: Awaited<ReturnType<typeof bot.channels.fetch>> | null,
): Promise<void> => {
  // Unmute everyone we had muted.
  if (voiceChannel?.isVoiceBased()) {
    await Promise.all(
      voiceChannel.members.map((m) =>
        m.voice.setMute(false).catch(() => undefined),
      ),
    )
    await voiceChannel.delete().catch(() => undefined)
  }

  // Unmute anyone who left the channel but still carries the mute.
  const guild = await bot.guilds.fetch(stream.guildId).catch(() => null)
  if (guild) {
    const members = await guild.members.fetch()
    for (const userId of stream.mutedUserIds) {
      const member = members.get(userId)
      if (member) {
        await member.voice.setMute(false).catch(() => undefined)
      }
    }
  }

  const [controlsChannel, categoryChannel] = await Promise.all([
    bot.channels.fetch(stream.controlsChannelId).catch(() => null),
    bot.channels.fetch(stream.categoryId).catch(() => null),
  ])
  await controlsChannel?.delete().catch(() => undefined)
  await categoryChannel?.delete().catch(() => undefined)

  await removeActiveStream(bot.db, stream.voiceChannelId)
}

const restoreStreams = async (bot: MarcelToing): Promise<void> => {
  const streams = await getAllActiveStreams(bot.db)
  if (streams.length === 0) return

  console.log(`Processing ${streams.length} stream channel(s) from previous session...`)

  for (const stream of streams) {
    await restoreOrCleanupStream(bot, stream)
  }

  console.log('Stream channel recovery complete.')
}

export const ready = async (bot: MarcelToing) => {
  console.log('Discord ready!')

  await restoreStreams(bot)

  const greetingChannel = await bot.channels.fetch(bot.config.greetingChannelId)
  if (greetingChannel === null || !greetingChannel.isSendable()) {
    console.error('Could not find greeting channel.')
    return
  }

  const doc = await bot.db
    .collection(BOT_STATE_COLLECTION)
    .findOne({ key: 'lastMeetGreeting' })
  const lastTime = (doc?.value as number) ?? 0

  if (Date.now() - lastTime < ONE_DAY_MS) return

  await bot.db
    .collection(BOT_STATE_COLLECTION)
    .updateOne(
      { key: 'lastMeetGreeting' },
      { $set: { value: Date.now() } },
      { upsert: true },
    )

  greetingChannel.send('Meet Marcel Toing!').catch((err) => console.error(err))
}
