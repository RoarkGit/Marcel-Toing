import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  type Interaction,
  MessageFlags,
} from 'discord.js'

import {
  BUTTON_APPROVE_SPEAK_PREFIX,
  BUTTON_CLOSE_CHANNEL,
  BUTTON_OPEN_CHANNEL,
  BUTTON_REQUEST_SPEAK,
} from '../constants'
import { closeChannel, openChannel } from '../handlers/streamChannel'
import type { MarcelToing } from '../interfaces/MarcelToing'

/**
 * Handles slash command interaction.
 * @param interaction the interaction that triggered the event
 * @param bot MarcelToing client instance
 */
export const interactionCreate = async (
  interaction: Interaction,
  bot: MarcelToing,
) => {
  // Handle slash command.
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

    const channelData = bot.state.activeStreamChannels.get(channelId)
    if (!channelData) return

    if (customId === BUTTON_REQUEST_SPEAK) {
      if (member.voice.channelId !== channelId || !member.voice.serverMute) {
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
      if (member.id !== channelData.creatorId) {
        await interaction.reply({
          content: 'Only the channel creator can approve speak requests.',
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      const targetId = customId.slice(BUTTON_APPROVE_SPEAK_PREFIX.length)
      const channel = await bot.channels.fetch(channelId)
      if (!channel?.isVoiceBased()) return

      const target = channel.members.get(targetId)
      if (!target) {
        await interaction.update({
          content: '⚠️ That user is no longer in the channel.',
          components: [],
        })
        return
      }

      channelData.allowedSpeakers.set(targetId, Infinity)
      await target.voice.setMute(false)
      await interaction.update({
        content: `✅ **${target.displayName}** can now speak.`,
        components: [],
      })
    } else if (
      customId === BUTTON_OPEN_CHANNEL ||
      customId === BUTTON_CLOSE_CHANNEL
    ) {
      if (member.id !== channelData.creatorId) {
        await interaction.reply({
          content: 'Only the channel creator can do that.',
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      const channel = await bot.channels.fetch(channelId)
      if (!channel?.isVoiceBased()) return

      if (customId === BUTTON_OPEN_CHANNEL) {
        await openChannel(channel, channelData, bot)
        await interaction.reply({
          content: 'Everyone in the channel can now speak.',
          flags: MessageFlags.Ephemeral,
        })
      } else {
        await closeChannel(channel, channelData, member.id, bot)
        await interaction.reply({
          content: 'Channel closed — only you can speak.',
          flags: MessageFlags.Ephemeral,
        })
      }
    }
  } else if (interaction.isAutocomplete()) {
    // Handle autocomplete.
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
