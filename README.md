# KissFM Discord Radio Bot 📻

A simple Discord bot that joins a specific voice channel and streams an internet radio station whenever at least one user is present in that channel.

## Features

- **Auto-Join & Auto-Leave:** The bot automatically joins the target voice channel as soon as any user enters it, and leaves when the last user disconnects.
- **Presence-Based Logic:** The bot monitors the member count of the target channel — it doesn't follow a specific user, it follows the crowd.
- **Continuous Stream:** Uses `ffmpeg` to stream internet radio efficiently with robust reconnection logic.
- **Easy Configuration:** Configurable entirely via environment variables.

## Requirements

- [Node.js](https://nodejs.org/) (v16.14.0 or higher recommended)
- [FFmpeg](https://ffmpeg.org/) installed and available in your system's PATH.
- A Discord Bot Token. Make sure to enable all the necessary Privileged Intents in your Discord Developer Portal for the bot.

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
TARGET_VOICE_CHANNEL_ID=the_voice_channel_id_to_join
RADIO_URL=the_audio_stream_url
```

- `DISCORD_TOKEN`: Your bot's token from the Discord Developer Portal.
- `TARGET_VOICE_CHANNEL_ID`: The ID of the voice channel where the bot will play the radio.
- `RADIO_URL`: The direct URL to the internet radio audio stream (e.g., an MP3, AAC, or M3U8 stream).

## Usage

Start the bot with:

```bash
node index.js
```

Once running, the bot will monitor the target voice channel. As soon as any user joins, the bot will automatically enter the channel and start streaming the configured radio URL. When the last user leaves, the bot will stop the stream and disconnect.

