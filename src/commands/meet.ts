import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

import type { Command } from '../interfaces/Command'

/**
 * Allows people to meet Marcel Toing.
 */
export const meet: Command = {
  data: new SlashCommandBuilder()
    .setName('meet')
    .setDescription('Meet Marcel Toing!'),
  run: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    await interaction.reply('https://www.youtube.com/watch?v=bv3VdaGQ_00')
  },
}
