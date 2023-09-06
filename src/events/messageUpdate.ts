import { Message, type PartialMessage } from 'discord.js'

import type { MarcelToing } from '../interfaces/MarcelToing'

/**
 * Handles updated message events.
 * @param message the message that triggered the event
 * @param bot MarcelToing client instance
 */
export const messageUpdate = async (
  message: Message<boolean> | PartialMessage,
  bot: MarcelToing,
) => {
  if (message.author !== bot.user && message.content !== null) {
    const tatoing = bot.emojis.cache.find((e) => e.name === 'tatoing')
    if (tatoing !== undefined) {
      if (message.content.toLowerCase().includes('toing')) {
        message.react(tatoing).catch((err) => console.error(err))
      } else if (bot.user !== null) {
        message.reactions.cache.get(tatoing.id)?.users.remove(bot.user.id)
      }
    }
  }
}
