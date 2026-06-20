import {
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js'

import { addStreamMod, getStreamMods, removeStreamMod } from '../db/streamMods'
import type { Command } from '../interfaces/Command'
import type { MarcelToing } from '../interfaces/MarcelToing'

export const streammod: Command = {
  data: new SlashCommandBuilder()
    .setName('streammod')
    .setDescription('Manage your stream moderators.')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a stream moderator.')
        .addUserOption((opt) =>
          opt
            .setName('user')
            .setDescription('The user to add as a mod.')
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a stream moderator.')
        .addUserOption((opt) =>
          opt
            .setName('user')
            .setDescription('The user to remove as a mod.')
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName('list').setDescription('List your stream moderators.'),
    ),

  run: async (
    interaction: ChatInputCommandInteraction,
    bot: MarcelToing,
  ): Promise<void> => {
    const sub = interaction.options.getSubcommand()

    if (sub === 'add') {
      const target = interaction.options.getUser('user', true)
      await addStreamMod(bot.db, interaction.user.id, target.id)
      await interaction.reply({
        content: `**${target.displayName}** is now a stream mod.`,
        flags: MessageFlags.Ephemeral,
      })
    } else if (sub === 'remove') {
      const target = interaction.options.getUser('user', true)
      await removeStreamMod(bot.db, interaction.user.id, target.id)
      await interaction.reply({
        content: `**${target.displayName}** is no longer a stream mod.`,
        flags: MessageFlags.Ephemeral,
      })
    } else if (sub === 'list') {
      const mods = await getStreamMods(bot.db, interaction.user.id)
      if (mods.length === 0) {
        await interaction.reply({
          content: 'You have no stream mods.',
          flags: MessageFlags.Ephemeral,
        })
        return
      }
      const list = mods.map((id) => `<@${id}>`).join(', ')
      await interaction.reply({
        content: `Your stream mods: ${list}`,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
