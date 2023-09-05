import { readdir } from 'fs/promises'
import { join } from 'path'

import { Collection } from 'discord.js'

import type { Command } from '../interfaces/Command'
import type { MarcelToing } from '../interfaces/MarcelToing'

/**
 * Attempts to load all Commands stored in the commands folder.
 * @returns Boolean indicating success.
 */
export const loadCommands = async (
  bot: MarcelToing,
  commandsPath: string,
): Promise<boolean> => {
  try {
    const commands: Collection<string, Command> = new Collection<
      string,
      Command
    >()
    const files = await readdir(commandsPath)

    for (const file of files) {
      const name = file.split('.')[0]
      const module = await import(join(commandsPath, file))
      commands.set(name, module[name])
    }

    bot.commands = commands
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}
