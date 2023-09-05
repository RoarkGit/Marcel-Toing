<h1 align="center">Marcel Toing</h1>
<h3 align="center">A bot for shitposting in the Dorknerds Worldwide server.</h3>

---

## Development Requirements
- [discord.js](https://github.com/discordjs/discord.js)
- `applications.commands` scope enabled for bot (to use Slash commands)
- TypeScript
- Node

## Supported commands
- `/meet`: introduces users to Marcel Toing

## Technical Information

### Commands
Commands are implemented using [command handlers](https://discordjs.guide/creating-your-bot/command-handling.html) and stored in `./commands`.

### Events
Events are implemented using [event handlers](https://discordjs.guide/creating-your-bot/event-handling.html) and stored in `./events`

### Helper Modules
Helper modules, such as `validateEnv.js` for loading environment variables, are stored in `./modules`.

### Bot Utilities
Bot utilities, such as those for loading and registering commands, are stored in `./utils`.

### Configuration
Configuration is stored in `.env.dev` and `.env.prod`.

The following values are required:

|Value           |Description|
|----------------------|----------------------------------------------------------|
|`BOT_TOKEN`           |Discord bot API token.                                    |
|`CLIENT_ID`           |The bot application ID.                                   |
|`GREETING_CHANNEL_ID` |The ID of the channel to which a greeting message is sent.|
|`NODE_ENV`            |The environment in which the bot is running (e.g. `prod`).|
|`HOME_GUILD_ID`       |The ID of the home guild in which the bot is running.     |
|`PRUNE_CHANNELS`      |Comma-separated list of channel IDs to prune.             |

## Contributing
All you need to do is go to https://www.discord.com/developers and create a new application. This will give you the token and client ID, which you can then use to connect the bot to a test server. If you're adding something new, just create a pull request.
