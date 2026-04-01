require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} = require("@discordjs/voice");
const { spawn } = require("child_process");

const TOKEN = process.env.DISCORD_TOKEN;

const TARGET_VOICE_CHANNEL_ID = process.env.TARGET_VOICE_CHANNEL_ID;
const RADIO_URL = process.env.RADIO_URL;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

let connection = null;
let player = null;
let ffmpegProcess = null;

async function startRadio(channel) {
  if (!channel) return;
  if (connection) return;

  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: false,
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

  ffmpegProcess = spawn("ffmpeg", [
    "-reconnect", "1",
    "-reconnect_streamed", "1",
    "-reconnect_delay_max", "5",
    "-i", RADIO_URL,
    "-analyzeduration", "0",
    "-loglevel", "0",
    "-f", "s16le",
    "-ar", "48000",
    "-ac", "2",
    "pipe:1",
  ], {
    stdio: ["ignore", "pipe", "ignore"],
  });

  const resource = createAudioResource(ffmpegProcess.stdout, {
    inputType: StreamType.Raw,
  });

  player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play,
    },
  });

  connection.subscribe(player);
  player.play(resource);

  player.on("error", (err) => {
    console.error("Player error:", err);
    stopRadio();
  });

  player.on(AudioPlayerStatus.Idle, () => {
    console.log("Stream finished.");
    stopRadio();
  });

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    console.log("Bot disconnected.");
    stopRadio();
  });

  console.log("Radio started.");
}

function stopRadio() {
  try {
    if (player) player.stop();
  } catch {}

  try {
    if (connection) connection.destroy();
  } catch {}

  try {
    if (ffmpegProcess) ffmpegProcess.kill("SIGKILL");
  } catch {}

  player = null;
  connection = null;
  ffmpegProcess = null;
}

client.once("clientReady", () => {
  console.log(`Bot online as ${client.user.tag}`);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  // Only care about events involving the target channel
  const isTargetChannelInvolved =
    oldState.channelId === TARGET_VOICE_CHANNEL_ID ||
    newState.channelId === TARGET_VOICE_CHANNEL_ID;

  if (!isTargetChannelInvolved) return;

  const guild = newState.guild ?? oldState.guild;
  const targetChannel = guild.channels.cache.get(TARGET_VOICE_CHANNEL_ID);
  if (!targetChannel) return;

  // Count only non-bot members in the target channel
  const humanCount = targetChannel.members.filter((m) => !m.user.bot).size;

  if (humanCount > 0 && !connection) {
    try {
      console.log(`Joining target channel (${humanCount} user(s) present).`);
      await startRadio(targetChannel);
    } catch (err) {
      console.error("Error starting radio:", err);
      stopRadio();
    }
  } else if (humanCount === 0 && connection) {
    console.log("No users left in channel, leaving.");
    stopRadio();
  }
});

client.login(TOKEN);