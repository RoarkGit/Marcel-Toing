import type { Client, Collection } from 'discord.js'
import type { Db } from 'mongodb'

import type { Command } from './Command'
import type { StreamChannelData } from './StreamChannelData'
import type { UserContextMenuCommand } from './UserContextMenuCommand'

export type { StreamChannelData }

export interface MarcelToing extends Client {
  commands: Collection<string, Command>
  userContextMenuCommands: Collection<string, UserContextMenuCommand>
  db: Db
  config: {
    env: string
    greetingChannelId: string
    guildId: string
    id: string
    mongodbUri: string
    streamingLobbyId: string
    token: string
  }
  state: {
    hellYeahCounter: Collection<string, number>
    lastHellYeah: Collection<string, number>
    activeStreamChannels: Map<string, StreamChannelData>
    controlsToVoiceChannel: Map<string, string>
  }
}
