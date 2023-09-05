import type {
  AutocompleteInteraction,
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js'

import type { MarcelToing } from './MarcelToing'

/**
 * Represents an abstract Slash command.
 */
export interface Command {
  /**
   * Command data (name, options, etc.).
   */
  data:
    | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
    | SlashCommandSubcommandsOnlyBuilder
  /**
   * Command action to run.
   */
  run: (interaction: CommandInteraction, bot: MarcelToing) => Promise<void>
  autocomplete?: (
    bot: MarcelToing,
    prefix: string,
    interaction: AutocompleteInteraction,
  ) => string[]
}
