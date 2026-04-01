# KissFM Radio Bot 📻

A simple Discord bot that joins a specific voice channel and streams an internet radio station whenever a specific user joins that channel.

## Features

- **Auto-Join & Auto-Leave:** The bot automatically joins the target voice channel when the designated user joins, and leaves when they leave.
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
MY_USER_ID=your_discord_user_id
TARGET_VOICE_CHANNEL_ID=the_voice_channel_id_to_join
RADIO_URL=the_audio_stream_url
```

- `DISCORD_TOKEN`: Your bot's token from the Discord Developer Portal.
- `MY_USER_ID`: The Discord ID of the user the bot should monitor.
- `TARGET_VOICE_CHANNEL_ID`: The ID of the voice channel where the bot will play the radio.
- `RADIO_URL`: The direct URL to the internet radio audio stream (e.g., an MP3, AAC, or M3U8 stream).

## Usage

Start the bot with:

```bash
node index.js
```

Once running, simply join your designated target voice channel. The bot will automatically follow you into the channel and start streaming the configured radio URL. When you leave, the bot will stop the stream and disconnect.
