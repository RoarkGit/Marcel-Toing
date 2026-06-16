import {
  type MessageReaction,
  type PartialMessageReaction,
  type PartialUser,
  type User,
} from 'discord.js'

import {
  hellYeahReaction,
  hellYeahReactionRemove,
} from '../handlers/hellYeahReaction'
import type { MarcelToing } from '../interfaces/MarcelToing'

export const reactionAdd = (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  bot: MarcelToing,
) => {
  hellYeahReaction(reaction, user, bot).catch((err) => console.error(err))
}

export const reactionRemove = (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  bot: MarcelToing,
) => {
  hellYeahReactionRemove(reaction, user, bot).catch((err) => console.error(err))
}
