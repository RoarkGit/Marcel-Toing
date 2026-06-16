import type {
  ContextMenuCommandBuilder,
  UserContextMenuCommandInteraction,
} from 'discord.js'

import type { MarcelToing } from './MarcelToing'

export interface UserContextMenuCommand {
  data: ContextMenuCommandBuilder
  run: (
    interaction: UserContextMenuCommandInteraction,
    bot: MarcelToing,
  ) => Promise<void>
}
