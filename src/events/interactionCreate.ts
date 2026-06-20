import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  type Interaction,
  MessageFlags,
  StringSelectMenuBuilder,
} from 'discord.js'

import {
  BUTTON_APPROVE_SPEAK_PREFIX,
  BUTTON_CLOSE_CHANNEL,
  BUTTON_MANAGE_MODS,
  BUTTON_OPEN_CHANNEL,
  BUTTON_REQUEST_SPEAK,
  SELECT_MANAGE_MODS,
} from '../constants'
import { addAllowedSpeaker } from '../db/activeStreams'
import { getStreamMods, isStreamMod, setStreamMods } from '../db/streamMods'
import { closeChannel, openChannel } from '../handlers/streamChannel'
import type { MarcelToing, StreamChannelData } from '../interfaces/MarcelToing'

const resolveStreamChannel = (
  channelId: string,
  bot: MarcelToing,
): { voiceChannelId: string; channelData: StreamChannelData } | undefined => {
  const direct = bot.state.activeStreamChannels.get(channelId)
  if (direct) return { voiceChannelId: channelId, channelData: direct }

  const voiceId = bot.state.controlsToVoiceChannel.get(channelId)
  if (!voiceId) return undefined

  const data = bot.state.activeStreamChannels.get(voiceId)
  if (!data) return undefined

  return { voiceChannelId: voiceId, channelData: data }
}

const canControlStream = async (
  memberId: string,
  channelData: StreamChannelData,
  bot: MarcelToing,
): Promise<boolean> => {
  if (memberId === channelData.creatorId) return true
  return isStreamMod(bot.db, channelData.creatorId, memberId)
}

export const interactionCreate = async (
  interaction: Interaction,
  bot: MarcelToing,
) => {
  if (interaction.isChatInputCommand()) {
    const command = bot.commands.get(interaction.commandName)

    if (command === undefined) return

    command.run(interaction, bot).catch((err) => console.error(err))
  } else if (interaction.isUserContextMenuCommand()) {
    const command = bot.userContextMenuCommands.get(interaction.commandName)
    if (command === undefined) return
    command.run(interaction, bot).catch((err) => console.error(err))
  } else if (interaction.isButton()) {
    const { customId, channelId } = interaction
    const member = interaction.member
    if (!(member instanceof GuildMember)) return

    const resolved = resolveStreamChannel(channelId, bot)
    if (!resolved) return
    const { voiceChannelId, channelData } = resolved

    if (customId === BUTTON_REQUEST_SPEAK) {
      if (
        member.voice.channelId !== voiceChannelId ||
        !member.voice.serverMute
      ) {
        await interaction.reply({
          content: "You're not muted in this channel.",
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      await interaction.reply({
        content: `<@${channelData.creatorId}>, **${member.displayName}** wants to speak!`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`${BUTTON_APPROVE_SPEAK_PREFIX}${member.id}`)
              .setLabel('Approve')
              .setStyle(ButtonStyle.Success),
          ),
        ],
      })
    } else if (customId.startsWith(BUTTON_APPROVE_SPEAK_PREFIX)) {
      if (!(await canControlStream(member.id, channelData, bot))) {
        await interaction.reply({
          content: 'Only the channel creator or a stream mod can approve speak requests.',
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      const targetId = customId.slice(BUTTON_APPROVE_SPEAK_PREFIX.length)
      const channel = await bot.channels.fetch(voiceChannelId)
      if (!channel?.isVoiceBased()) return

      const target = channel.members.get(targetId)
      if (!target) {
        await interaction.update({
          content: 'That user is no longer in the channel.',
          components: [],
        })
        return
      }

      channelData.allowedSpeakers.add(targetId)
      await Promise.all([
        target.voice.setMute(false),
        addAllowedSpeaker(bot.db, voiceChannelId, targetId),
      ])
      await interaction.update({
        content: `**${target.displayName}** can now speak.`,
        components: [],
      })
    } else if (customId === BUTTON_MANAGE_MODS) {
      if (member.id !== channelData.creatorId) {
        await interaction.reply({
          content: 'Only the channel creator can manage mods.',
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      const currentModIds = await getStreamMods(bot.db, member.id)
      const currentMods = new Set(currentModIds)

      const channel = await bot.channels.fetch(voiceChannelId)
      const inChannel = channel?.isVoiceBased()
        ? [...channel.members.values()]
            .filter((m) => !m.user.bot && m.id !== member.id)
        : []
      const inChannelIds = new Set(inChannel.map((m) => m.id))

      const guild = interaction.guild
      if (!guild) return

      const modsNotInChannel = currentModIds.filter(
        (id) => !inChannelIds.has(id),
      )
      const modMembers =
        modsNotInChannel.length > 0
          ? await guild.members.fetch({ user: modsNotInChannel })
          : new Map()

      const options = [
        ...inChannel.map((m) => ({
          label: `${m.displayName} (in channel)`,
          value: m.id,
          default: currentMods.has(m.id),
        })),
        ...modsNotInChannel
          .map((id) => {
            const m = modMembers.get(id)
            return {
              label: m?.displayName ?? `Unknown (${id})`,
              value: id,
              default: true,
            }
          }),
      ].slice(0, 25)

      if (options.length === 0) {
        await interaction.reply({
          content: 'No eligible users found.',
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      const menu = new StringSelectMenuBuilder()
        .setCustomId(SELECT_MANAGE_MODS)
        .setPlaceholder('Select your stream mods')
        .setMinValues(0)
        .setMaxValues(options.length)
        .addOptions(options)

      await interaction.reply({
        content: 'Select your stream mods. Current mods are pre-selected.',
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),
        ],
        flags: MessageFlags.Ephemeral,
      })
    } else if (
      customId === BUTTON_OPEN_CHANNEL ||
      customId === BUTTON_CLOSE_CHANNEL
    ) {
      if (!(await canControlStream(member.id, channelData, bot))) {
        await interaction.reply({
          content: 'Only the channel creator or a stream mod can do that.',
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      const channel = await bot.channels.fetch(voiceChannelId)
      if (!channel?.isVoiceBased()) return

      if (customId === BUTTON_OPEN_CHANNEL) {
        await openChannel(channel, channelData, bot)
        await interaction.reply({
          content: 'Everyone in the channel can now speak.',
          flags: MessageFlags.Ephemeral,
        })
      } else {
        await closeChannel(channel, channelData, channelData.creatorId, bot)
        await interaction.reply({
          content: 'Channel closed. Only the creator can speak.',
          flags: MessageFlags.Ephemeral,
        })
      }
    }
  } else if (interaction.isStringSelectMenu()) {
    const { customId } = interaction
    const member = interaction.member
    if (!(member instanceof GuildMember)) return

    if (customId === SELECT_MANAGE_MODS) {
      const selectedIds = interaction.values
      await setStreamMods(bot.db, member.id, selectedIds)

      if (selectedIds.length === 0) {
        await interaction.update({
          content: 'All stream mods removed.',
          components: [],
        })
      } else {
        const mentions = selectedIds.map((id) => `<@${id}>`).join(', ')
        await interaction.update({
          content: `Stream mods updated: ${mentions}`,
          components: [],
        })
      }
    }
  } else if (interaction.isAutocomplete()) {
    const command = bot.commands.get(interaction.commandName)

    if (command === undefined || command.autocomplete === undefined) return

    const prefix = interaction.options.getFocused()
    const choices = command.autocomplete(bot, prefix, interaction)
    choices.sort()

    interaction
      .respond(choices.slice(0, 25).map((c) => ({ name: c, value: c })))
      .catch((err) => console.error(err))
  }
}
