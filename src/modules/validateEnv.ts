import type { MarcelToing } from '../interfaces/MarcelToing'

/**
 * Reads and validate .env file for required values and correctness.
 * @param bot MarcelToing client instance
 * @returns Whether or not the environment variables were valid.
 */
export const validateEnv = (
  bot: MarcelToing,
): { valid: true } | { valid: false; message: string } => {
  if (process.env.BOT_TOKEN === undefined) {
    return { valid: false, message: 'Missing bot token.' }
  }

  if (process.env.CLIENT_ID === undefined) {
    return { valid: false, message: 'Missing client ID.' }
  }

  if (process.env.GUILD_ID === undefined) {
    return { valid: false, message: 'Missing guild ID.' }
  }

  if (process.env.GREETING_CHANNEL_ID === undefined) {
    return { valid: false, message: 'Missing greeting channel ID.' }
  }

  if (process.env.STREAMING_LOBBY_ID === undefined) {
    return { valid: false, message: 'Missing streaming lobby channel ID.' }
  }

  if (process.env.NODE_ENV === undefined) {
    return { valid: false, message: 'Missing node environment.' }
  }

  bot.config = {
    env: process.env.NODE_ENV,
    greetingChannelId: process.env.GREETING_CHANNEL_ID,
    guildId: process.env.GUILD_ID,
    id: process.env.CLIENT_ID,
    streamingLobbyId: process.env.STREAMING_LOBBY_ID,
    token: process.env.BOT_TOKEN,
  }

  return { valid: true }
}
