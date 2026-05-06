import { type Message } from 'discord.js'

import { hellYeah } from '../handlers/hellYeah'
import { toingReaction } from '../handlers/toingReaction'
import type { MarcelToing } from '../interfaces/MarcelToing'

export const messageCreate = (message: Message, bot: MarcelToing) => {
  toingReaction(message, bot)
  hellYeah(message, bot)
}
