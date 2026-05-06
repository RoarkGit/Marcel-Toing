import { type Message, type PartialMessage } from 'discord.js'

import { toingReactionUpdate } from '../handlers/toingReaction'
import type { MarcelToing } from '../interfaces/MarcelToing'

export const messageUpdate = (
  message: Message<boolean> | PartialMessage,
  bot: MarcelToing,
) => {
  toingReactionUpdate(message, bot)
}
