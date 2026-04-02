# KissFM Discord Radio Bot 📻

A simple Discord bot that joins your voice channel and streams an internet radio station when you use the `/mdma` slash command. It also automatically leaves the channel when no users are left.

## Features

- **Slash Command:** Easily summon the bot to your current voice channel using `/mdma`.
- **Multi-Server Support:** The bot can stream music in multiple voice channels across different servers simultaneously without interference.
- **Auto-Leave:** The bot monitors the voice channel and automatically disconnects when the last human user leaves, saving bandwidth and resources.
- **Continuous Stream:** Uses `ffmpeg` to stream internet radio efficiently with robust reconnection logic.

## Requirements

- [Node.js](https://nodejs.org/) (v22 or higher)
- [FFmpeg](https://ffmpeg.org/) installed and available in your system's PATH.
- A Discord Bot Token.
- Your bot must be invited to servers with the `application.commands` scope via OAuth2 URL generator.

## Installation

1. Clone or download the repository.
2. Install the dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory and configure your variables:

```env
DISCORD_TOKEN=your_discord_bot_token_here
RADIO_URL=http://your_stream_link.mp3
```

- `DISCORD_TOKEN`: Your bot's token from the Discord Developer Portal.
- `RADIO_URL`: The direct URL to the internet radio audio stream.

## Usage

Start the bot with:

```bash
node index.js
```

Once running, join any voice channel and type `/mdma`. The bot will instantly join your voice channel and start streaming. When everyone leaves the channel, the bot will automatically disconnect and clean up resources!
