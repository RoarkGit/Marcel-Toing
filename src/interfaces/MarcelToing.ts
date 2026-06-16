import type { Client, Collection } from 'discord.js'

import type { Command } from './Command'
import type { StreamChannelData } from './StreamChannelData'
import type { UserContextMenuCommand } from './UserContextMenuCommand'

export type { StreamChannelData }

/**
 * Implementation of Discord client.
 */
export interface MarcelToing extends Client {
  /**
   * Collection of Commands stored as name:Command pairs.
   */
  commands: Collection<string, Command>
  userContextMenuCommands: Collection<string, UserContextMenuCommand>
  config: {
    env: string
    greetingChannelId: string
    guildId: string
    id: string
    streamingLobbyId: string
    token: string
  }
  state: {
    hellYeahCounter: Collection<string, number>
    lastHellYeah: Collection<string, number>
    activeStreamChannels: Map<string, StreamChannelData>
  }
}
