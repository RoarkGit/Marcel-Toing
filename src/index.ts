import { join } from 'path'

import { Client, GatewayIntentBits, Partials } from 'discord.js'

import { handleEvents } from './events/handleEvents'
import type { MarcelToing } from './interfaces/MarcelToing'
import { validateEnv } from './modules/validateEnv'
import { loadCommands } from './utils/loadCommands'
import { registerCommands } from './utils/registerCommands'

/**
 * Main entry point for Marcel Toing.
 */
void (async () => {
  const bot = new Client({
    intents:
      GatewayIntentBits.Guilds |
      GatewayIntentBits.GuildMembers |
      GatewayIntentBits.GuildMessages |
      GatewayIntentBits.MessageContent,
    partials: [Partials.GuildMember, Partials.Message],
  }) as MarcelToing

  // Validate and load environment variables.
  const validatedEnvironment = await validateEnv(bot)
  if (!validatedEnvironment.valid) {
    console.error(validatedEnvironment.message)
    return
  }

  // Load commands.
  const commandsPath =
    bot.config.env === 'prod'
      ? join(process.cwd(), 'prod', 'commands')
      : join(process.cwd(), 'src', 'commands')
  if (!(await loadCommands(bot, commandsPath))) {
    console.error('Failed to load commands.')
    return
  }

  // Register commands.
  if (!(await registerCommands(bot))) {
    console.error('Failed to register commands.')
    return
  }

  // Load event handlers.
  handleEvents(bot)

  await bot.login(bot.config.token)
})()
