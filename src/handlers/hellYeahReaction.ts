import { type MessageReaction, type PartialMessageReaction, type PartialUser, type User } from 'discord.js'

import type { MarcelToing } from '../interfaces/MarcelToing'

export const hellYeahReaction = async (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  bot: MarcelToing,
) => {
  if (user.id === bot.user?.id) return
  if (reaction.emoji.name !== 'hellyeahbrother') return

  if (reaction.partial) {
    reaction = await reaction.fetch()
  }

  reaction.message.react(reaction.emoji).catch((err) => console.error(err))
}

export const hellYeahReactionRemove = async (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  bot: MarcelToing,
) => {
  if (user.id === bot.user?.id) return
  if (reaction.emoji.name !== 'hellyeahbrother') return
  if (!bot.user) return

  if (reaction.partial) {
    reaction = await reaction.fetch()
  }

  if (reaction.count === 1 && reaction.users.cache.has(bot.user.id)) {
    reaction.users.remove(bot.user.id).catch((err) => console.error(err))
  }
}
