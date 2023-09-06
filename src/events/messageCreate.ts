import { type Message } from 'discord.js'

import type { MarcelToing } from '../interfaces/MarcelToing'

/**
 * Handles new message events.
 * @param message the message that triggered the event
 * @param bot MarcelToing client instance
 */
export const messageCreate = (message: Message, bot: MarcelToing) => {
  if (
    message.author !== bot.user &&
    message.content.toLowerCase().includes('toing')
  ) {
    const tatoing = bot.emojis.cache.find((e) => e.name === 'tatoing')
    if (tatoing !== undefined) {
      message.react(tatoing).catch((err) => console.error(err))
    }
  }
}
