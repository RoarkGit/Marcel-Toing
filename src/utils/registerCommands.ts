import { REST } from '@discordjs/rest'
import {
  type RESTPostAPIApplicationCommandsJSONBody,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js'

import type { MarcelToing } from '../interfaces/MarcelToing'

/**
 * Attempts to register all Commands in the commands folder.
 * @param bot MarcelToing client instance
 * @returns Whether or not the commands were successfully registered.
 */
export const registerCommands = async (bot: MarcelToing): Promise<boolean> => {
  try {
    const rest = new REST({ version: '10' }).setToken(bot.config.token)

    const commandData: Array<
      | RESTPostAPIApplicationCommandsJSONBody
      | RESTPostAPIChatInputApplicationCommandsJSONBody
    > = []

    bot.commands.forEach((command) => {
      const data = command.data.toJSON()
      commandData.push(data)
    })

    console.info('Registering commands.')
    await rest.put(
      Routes.applicationGuildCommands(bot.config.id, bot.config.guildId),
      {
        body: commandData,
      },
    )

    return true
  } catch (err) {
    console.error('Failed to register commands:', err)
    return false
  }
}
