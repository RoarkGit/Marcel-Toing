import type { MarcelToing } from '../interfaces/MarcelToing'

/**
 * Prints message when bot is connected and ready.
 * @param bot MarcelToing client instance
 */
export const ready = async (bot: MarcelToing) => {
  console.log('Discord ready!')
  const greetingChannel = await bot.channels.fetch(bot.config.greetingChannelId)
  if (greetingChannel === null || !greetingChannel.isTextBased()) {
    console.error('Could not find greeting channel.')
    return
  }
  greetingChannel.send('Meet Marcel Toing!')
}
