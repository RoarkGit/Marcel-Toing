import { type Message } from 'discord.js'

import type { MarcelToing } from '../interfaces/MarcelToing'

const HELL_YEAH_COOLDOWN_MS = 1000 * 60 * 15 // Fifteen minutes
const HELL_YEAH_WINDOW_MS = 1000 * 60 * 60 // One hour

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
  if (
    message.author !== bot.user &&
    message.content.toLowerCase().startsWith('hell yea')
  ) {
    const channelId = message.channelId
    const lastHellYeah = bot.state.lastHellYeah.get(channelId)
    if (lastHellYeah && Date.now() - lastHellYeah < HELL_YEAH_COOLDOWN_MS) {
      return
    }
    const hellYeahCounter = bot.state.hellYeahCounter.get(channelId) || 0
    bot.state.hellYeahCounter.set(channelId, hellYeahCounter + 1)
    setTimeout(() => {
      const hellYeahCounter = bot.state.hellYeahCounter.get(channelId)
      if (hellYeahCounter) {
        bot.state.hellYeahCounter.set(channelId, hellYeahCounter - 1)
      }
    }, HELL_YEAH_WINDOW_MS)
    if (hellYeahCounter >= 2) {
      message.channel.send('hell yeah')
      bot.state.lastHellYeah.set(channelId, Date.now())
      bot.state.hellYeahCounter.set(channelId, 0)
    }
  }
}
