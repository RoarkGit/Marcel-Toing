import { Message } from 'discord.js'

import { interactionCreate } from './interactionCreate'
import { messageCreate } from './messageCreate'
import { ready } from './ready'
import type { MarcelToing } from '../interfaces/MarcelToing'

/**
 * Loads event handlers for Marcel Toing.
 * @param bot MarcelToing client instance
 */
export const handleEvents = (bot: MarcelToing): void => {
  // Runs when the bot is connected to Discord.
  bot.on('ready', () => {
    ready(bot).catch((err) => console.error(err))
  })

  // Runs on any interaction creation, e.g. a command being run.
  bot.on('interactionCreate', (interaction) => {
    interactionCreate(interaction, bot).catch((err) => console.error(err))
  })

  // Runs on message being sent.
  bot.on('messageCreate', (message) => {
    messageCreate(message, bot)
  })

  process.on('uncaughtException', (error) => {
    console.error(error)
  })
}
