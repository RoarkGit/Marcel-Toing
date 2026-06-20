import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  type VoiceState,
} from 'discord.js'

import {
  BUTTON_CLOSE_CHANNEL,
  BUTTON_MANAGE_MODS,
  BUTTON_OPEN_CHANNEL,
  BUTTON_REQUEST_SPEAK,
  CHANNEL_STATUS_OPEN,
} from '../constants'
import {
  addMutedUser,
  removeActiveStream,
  removeMutedUser,
  saveActiveStream,
} from '../db/activeStreams'
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

  if (newChannelId === streamingLobbyId) {
    const lobbyChannel = await bot.channels.fetch(streamingLobbyId)
    if (!lobbyChannel?.isVoiceBased()) return

    const category = await newState.guild.channels.create({
      name: `${member.displayName}'s Stream`,
      type: ChannelType.GuildCategory,
    })

    const [controlsChannel, streamChannel] = await Promise.all([
      newState.guild.channels.create({
        name: 'Stream Controls',
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: newState.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.SendMessages],
          },
          {
            id: bot.user!.id,
            allow: [PermissionFlagsBits.SendMessages],
          },
          {
            id: member.id,
            allow: [PermissionFlagsBits.SendMessages],
          },
        ],
      }),
      newState.guild.channels.create({
        name: 'Stream',
        type: ChannelType.GuildVoice,
        parent: category.id,
      }),
    ])

    bot.state.activeStreamChannels.set(streamChannel.id, {
      creatorId: member.id,
      open: true,
      allowedSpeakers: new Set(),
      categoryId: category.id,
      controlsChannelId: controlsChannel.id,
    })
    bot.state.controlsToVoiceChannel.set(controlsChannel.id, streamChannel.id)

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
      new ButtonBuilder()
        .setCustomId(BUTTON_MANAGE_MODS)
        .setLabel('Manage Mods')
        .setStyle(ButtonStyle.Secondary),
    )

    await Promise.all([
      member.voice.setChannel(streamChannel),
      bot.rest.put(
        `/channels/${streamChannel.id}/voice-status` as `/${string}`,
        {
          body: { status: CHANNEL_STATUS_OPEN },
        },
      ),
      controlsChannel.send({
        content: '🎙️ This channel is open. Everyone can speak.',
        components: [row],
      }),
      saveActiveStream(bot.db, {
        voiceChannelId: streamChannel.id,
        controlsChannelId: controlsChannel.id,
        categoryId: category.id,
        creatorId: member.id,
        guildId: newState.guild.id,
        open: true,
        allowedSpeakerIds: [],
        mutedUserIds: [],
      }),
    ])
    return
  }

  if (movedChannels && newChannelId) {
    const channelData = bot.state.activeStreamChannels.get(newChannelId)
    if (
      channelData &&
      member.id !== channelData.creatorId &&
      !channelData.open
    ) {
      if (!channelData.allowedSpeakers.has(member.id)) {
        await member.voice.setMute(true)
        await addMutedUser(bot.db, newChannelId, member.id)
      }
    }
  }

  if (movedChannels && oldChannelId) {
    const channelData = bot.state.activeStreamChannels.get(oldChannelId)
    if (!channelData) return

    await member.voice.setMute(false).catch(() => undefined)
    await removeMutedUser(bot.db, oldChannelId, member.id)

    const oldChannel = oldState.channel
    if (oldChannel && oldChannel.members.size === 0) {
      bot.state.controlsToVoiceChannel.delete(channelData.controlsChannelId)
      bot.state.activeStreamChannels.delete(oldChannelId)
      const [ctrlChannel, categoryChannel] = await Promise.all([
        bot.channels.fetch(channelData.controlsChannelId).catch(() => null),
        bot.channels.fetch(channelData.categoryId).catch(() => null),
      ])
      await Promise.all([
        oldChannel.delete().catch(() => undefined),
        ctrlChannel?.delete().catch(() => undefined),
        removeActiveStream(bot.db, oldChannelId),
      ])
      await categoryChannel?.delete().catch(() => undefined)
    }
  }
}
