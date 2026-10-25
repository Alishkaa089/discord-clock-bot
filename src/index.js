require('dotenv').config();

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const TIMEZONE = process.env.TIMEZONE || 'Asia/Baku';
const INTERVAL = Math.max(Number(process.env.UPDATE_INTERVAL_MS) || 600000, 60000);

if (!TOKEN || !GUILD_ID || !CHANNEL_ID) {
  console.error('Missing DISCORD_TOKEN / GUILD_ID / CHANNEL_ID in .env');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

let updateTimer = null;
let connection = null;

function timeString() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const h = parts.find((p) => p.type === 'hour').value;
  const m = parts.find((p) => p.type === 'minute').value;
  return `${h}:${m}`;
}

async function updateChannelName() {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;
    const channel = guild.channels.cache.get(CHANNEL_ID);
    if (!channel) return;
    const newName = `🕐 ${timeString()}`;
    if (channel.name !== newName) {
      await channel.setName(newName, 'clock update');
      console.log(`[clock] renamed -> ${newName}`);
    }
  } catch (err) {
    console.error('[clock] rename failed:', err?.message || err);
  }
}

async function joinChannel() {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;
    const channel = guild.channels.cache.get(CHANNEL_ID);
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      console.error('[voice] channel not found or not a voice channel');
      return;
    }
    const existing = getVoiceConnection(GUILD_ID);
    if (existing) {
      connection = existing;
      return;
    }
    connection = joinVoiceChannel({
      channelId: CHANNEL_ID,
      guildId: GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true,
    });
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.log('[voice] disconnected, attempting reconnect');
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
      } catch {
        connection.destroy();
        connection = null;
        setTimeout(joinChannel, 5000);
      }
    });
    connection.on('error', (e) => console.error('[voice] error:', e?.message || e));
    await entersState(connection, VoiceConnectionStatus.Ready, 20000);
    console.log('[voice] connected to', channel.name);
  } catch (err) {
    console.error('[voice] join failed:', err?.message || err);
    connection = null;
    setTimeout(joinChannel, 10000);
  }
}

client.once('ready', async () => {
  console.log(`[bot] logged in as ${client.user.tag}`);
  await joinChannel();
  await updateChannelName();
  if (updateTimer) clearInterval(updateTimer);
  updateTimer = setInterval(updateChannelName, INTERVAL);
  // Rejoin voice every 5 min if missing
  setInterval(async () => {
    const c = getVoiceConnection(GUILD_ID);
    if (!c || c.state.status === VoiceConnectionStatus.Destroyed) {
      console.log('[voice] connection missing, rejoining');
      connection = null;
      await joinChannel();
    }
  }, 300000);
});

client.on('error', (e) => console.error('[client] error:', e?.message || e));

process.on('unhandledRejection', (e) => console.error('[unhandled]', e));
process.on('uncaughtException', (e) => console.error('[uncaught]', e));

// Optional HTTP server for platforms that require a listening port (set PORT env).
if (process.env.PORT) {
  const http = require('http');
  http.createServer((_, res) => { res.writeHead(200); res.end('ok'); })
    .listen(Number(process.env.PORT), () => console.log('[http] listening on', process.env.PORT));
}

client.login(TOKEN);
