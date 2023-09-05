import { type Interaction, InteractionType } from 'discord.js'

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
  } else if (
    interaction.type === InteractionType.ApplicationCommandAutocomplete
  ) {
    // Handle autocomplete.
    const command = bot.commands.get(interaction.commandName)

    if (command == null || command.autocomplete == null) return

    const prefix = interaction.options.getFocused()
    const choices = command.autocomplete(bot, prefix, interaction)
    choices.sort()

    interaction
      .respond(choices.slice(0, 25).map((c) => ({ name: c, value: c })))
      .catch((err) => console.error(err))
  }
}
