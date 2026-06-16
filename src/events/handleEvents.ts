import { interactionCreate } from './interactionCreate'
import { messageCreate } from './messageCreate'
import { messageUpdate } from './messageUpdate'
import { reactionAdd, reactionRemove } from './reactionAdd'
import { ready } from './ready'
import { voiceStateUpdate } from './voiceStateUpdate'
import type { MarcelToing } from '../interfaces/MarcelToing'

/**
 * Loads event handlers for Marcel Toing.
 * @param bot MarcelToing client instance
 */
export const handleEvents = (bot: MarcelToing): void => {
  // Runs when the bot is connected to Discord.
  bot.on('clientReady', () => {
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

  // Runs on message being sent.
  bot.on('messageUpdate', (_, newMessage) => {
    messageUpdate(newMessage, bot)
  })

  // Runs when a reaction is added to a message.
  bot.on('messageReactionAdd', (reaction, user) => {
    reactionAdd(reaction, user, bot)
  })

  // Runs when a reaction is removed from a message.
  bot.on('messageReactionRemove', (reaction, user) => {
    reactionRemove(reaction, user, bot)
  })

  // Runs when a member's voice state changes (join/leave/stream start/stop).
  bot.on('voiceStateUpdate', (oldState, newState) => {
    voiceStateUpdate(oldState, newState, bot).catch((err) => console.error(err))
  })

  process.on('uncaughtException', (error) => {
    console.error(error)
  })
}
