import { type Message, type PartialMessage } from 'discord.js'

import type { MarcelToing } from '../interfaces/MarcelToing'

export const toingReaction = (message: Message, bot: MarcelToing) => {
  if (message.author === bot.user) return
  if (!message.content.toLowerCase().includes('toing')) return

  const tatoing = bot.emojis.cache.find((e) => e.name === 'tatoing')
  if (tatoing !== undefined) {
    message.react(tatoing).catch((err) => console.error(err))
  }
}

export const toingReactionUpdate = (
  message: Message<boolean> | PartialMessage,
  bot: MarcelToing,
) => {
  if (message.author === bot.user || message.content === null) return

  const tatoing = bot.emojis.cache.find((e) => e.name === 'tatoing')
  if (tatoing === undefined) return

  if (message.content.toLowerCase().includes('toing')) {
    message.react(tatoing).catch((err) => console.error(err))
  } else if (bot.user !== null) {
    message.reactions.cache.get(tatoing.id)?.users.remove(bot.user.id)
  }
}
