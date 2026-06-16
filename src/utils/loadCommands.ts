import { readdir } from 'fs/promises'
import { join, parse } from 'path'

import { Collection } from 'discord.js'

import type { Command } from '../interfaces/Command'
import type { MarcelToing } from '../interfaces/MarcelToing'
import type { UserContextMenuCommand } from '../interfaces/UserContextMenuCommand'

export const loadCommands = async (
  bot: MarcelToing,
  commandsPath: string,
): Promise<boolean> => {
  try {
    const commands = new Collection<string, Command>()
    const userContextMenuCommands = new Collection<
      string,
      UserContextMenuCommand
    >()
    const files = await readdir(commandsPath)

    for (const file of files) {
      const name = parse(file).name
      const module = await import(join(commandsPath, file))
      const exported = module[name]

      if ('data' in exported && exported.data.type !== undefined) {
        // ContextMenuCommandBuilder sets a type; SlashCommandBuilder does not.
        // Key by the Discord command name so interaction.commandName matches directly.
        const cmd = exported as UserContextMenuCommand
        userContextMenuCommands.set(cmd.data.name, cmd)
      } else {
        commands.set(name, exported as Command)
      }
    }

    bot.commands = commands
    bot.userContextMenuCommands = userContextMenuCommands
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}
