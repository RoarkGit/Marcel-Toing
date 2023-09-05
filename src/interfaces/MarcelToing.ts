import type { Client, Collection, Guild } from 'discord.js'

import type { Command } from './Command'

/**
 * Implementation of Discord client.
 */
export interface MarcelToing extends Client {
  /**
   * Collection of Commands stored as name:Command pairs.
   */
  commands: Collection<string, Command>
  // Various config values.
  config: {
    env: string
    greetingChannelId: string
    guildId: string
    id: string
    token: string
  }
}
