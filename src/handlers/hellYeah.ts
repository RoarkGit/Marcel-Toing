import { type Message } from 'discord.js'

import type { MarcelToing } from '../interfaces/MarcelToing'

const COOLDOWN_MS = 1000 * 60 * 15 // Fifteen minutes
const WINDOW_MS = 1000 * 60 * 60 // One hour

export const hellYeah = (message: Message, bot: MarcelToing) => {
  if (message.author === bot.user) return
  if (!message.content.toLowerCase().startsWith('hell yea')) return

  const channelId = message.channelId
  const lastHellYeah = bot.state.lastHellYeah.get(channelId)
  if (lastHellYeah && Date.now() - lastHellYeah < COOLDOWN_MS) return

  const count = bot.state.hellYeahCounter.get(channelId) ?? 0
  bot.state.hellYeahCounter.set(channelId, count + 1)
  setTimeout(() => {
    const current = bot.state.hellYeahCounter.get(channelId)
    if (current) bot.state.hellYeahCounter.set(channelId, current - 1)
  }, WINDOW_MS)

  if (count >= 2) {
    message.channel.isSendable() &&
      message.channel.send('hell yeah').catch((err) => console.error(err))
    bot.state.lastHellYeah.set(channelId, Date.now())
    bot.state.hellYeahCounter.set(channelId, 0)
  }
}
