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
const RADIO_URL = process.env.RADIO_URL;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Map to store active audio streams per guild
// Key: guildId
// Value: { connection, player, ffmpegProcess, activeChannelId }
const activeStreams = new Map();

async function startRadio(channel) {
  if (!channel) return;
  const guildId = channel.guild.id;

  if (activeStreams.has(guildId)) return;

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: false,
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

  const ffmpegProcess = spawn("ffmpeg", [
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

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play,
    },
  });

  connection.subscribe(player);
  player.play(resource);

  // Store the stream context for this guild
  activeStreams.set(guildId, {
    connection,
    player,
    ffmpegProcess,
    activeChannelId: channel.id,
  });

  player.on("error", (err) => {
    console.error(`[${guildId}] Player error:`, err);
    stopRadio(guildId);
  });

  player.on(AudioPlayerStatus.Idle, () => {
    console.log(`[${guildId}] Stream finished.`);
    stopRadio(guildId);
  });

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    console.log(`[${guildId}] Bot disconnected.`);
    stopRadio(guildId);
  });

  console.log(`[${guildId}] Radio started in channel: ${channel.name}`);
}

function stopRadio(guildId) {
  const stream = activeStreams.get(guildId);
  if (!stream) return;

  try { if (stream.player) stream.player.stop(); } catch {}
  try { if (stream.connection) stream.connection.destroy(); } catch {}
  try { if (stream.ffmpegProcess) stream.ffmpegProcess.kill("SIGKILL"); } catch {}

  activeStreams.delete(guildId);
  console.log(`[${guildId}] Radio stopped and resources cleaned up.`);
}

// ──────────────────────────────────────────────
// Slash command handler: /mdma
// ──────────────────────────────────────────────
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "mdma") return;

  const member = interaction.member;
  const voiceChannel = member.voice?.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: "❌ You must be in a voice channel to use this command!",
      ephemeral: true,
    });
  }

  const guildId = interaction.guildId;

  // If the bot is already active in this server
  if (activeStreams.has(guildId)) {
    return interaction.reply({
      content: "📻 The radio is already active on this server! Join the voice channel to listen.",
      ephemeral: true,
    });
  }

  await interaction.reply({
    content: `📻 Starting Kiss FM in **${voiceChannel.name}**...`,
    ephemeral: false,
  });

  try {
    await startRadio(voiceChannel);
  } catch (err) {
    console.error(`[${guildId}] Error starting radio:`, err);
    stopRadio(guildId);
    await interaction.editReply("❌ Error starting the radio. Please try again.");
  }
});

// ──────────────────────────────────────────────
// Auto-leave when the channel is empty
// ──────────────────────────────────────────────
client.on("voiceStateUpdate", (oldState, newState) => {
  const guild = newState.guild ?? oldState.guild;
  const guildId = guild.id;

  const stream = activeStreams.get(guildId);
  if (!stream) return;

  const activeChannel = guild.channels.cache.get(stream.activeChannelId);
  if (!activeChannel) return;

  // Count only humans left in the channel (exclude bots)
  const humanCount = activeChannel.members.filter((m) => !m.user.bot).size;

  if (humanCount === 0) {
    console.log(`[${guildId}] No users left in the channel, leaving...`);
    stopRadio(guildId);
  }
});

// ──────────────────────────────────────────────
client.once("clientReady", () => {
  console.log(`✅ Bot online as: ${client.user.tag}`);
});

client.login(TOKEN);