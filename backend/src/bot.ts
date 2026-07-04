import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';

type BotResponse = {
  message?: string;
  error?: string;
};

type BackendAlert = {
  id: string;
  title: string;
  message: string;
  severity: string;
  room?: string;
  timestamp: string;
};

const token = process.env.DISCORD_BOT_TOKEN;
const alertChannelId = process.env.DISCORD_ALERT_CHANNEL_ID;
const apiBase = process.env.DISCORD_API_BASE || process.env.API_BASE || 'http://localhost:3001';
const alertPollMs = Number.parseInt(process.env.DISCORD_ALERT_POLL_MS || '5000', 10);
const useMessageContentIntent = process.env.DISCORD_USE_MESSAGE_CONTENT_INTENT === 'true';
const postExistingAlertsOnStartup = process.env.DISCORD_POST_EXISTING_ALERTS_ON_STARTUP === 'true';

if (!token) {
  console.log('[Discord Bot] DISCORD_BOT_TOKEN is not set. Bot is disabled for this run.');
  process.exit(0);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    ...(useMessageContentIntent ? [GatewayIntentBits.MessageContent] : []),
  ],
});

const postedAlertIds = new Set<string>();
let alertWatcherPrimed = false;

client.once(Events.ClientReady, (readyClient) => {
  console.log(`[Discord Bot] Logged in as ${readyClient.user.tag}`);
  if (alertChannelId) {
    startAlertWatcher();
  } else {
    console.log('[Discord Bot] DISCORD_ALERT_CHANNEL_ID is not set. Proactive alert posts are disabled.');
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const normalizedContent = normalizeCommandText(message.content, client.user?.id);
  if (!normalizedContent.startsWith('!')) return;

  const [command, ...args] = normalizedContent.split(/\s+/);

  try {
    if (command === '!status') {
      await replyWithBackend(message, '/api/bot/status');
      return;
    }

    if (command === '!room') {
      const roomName = args.join(' ').trim();
      if (!roomName) {
        await message.reply('Tell me which room to check, for example `!room work1` or `!room drawing`.');
        return;
      }

      await replyWithBackend(message, `/api/bot/room/${encodeURIComponent(roomName)}`);
      return;
    }

    if (command === '!usage') {
      await replyWithBackend(message, '/api/bot/usage');
      return;
    }

    if (command === '!alerts') {
      await replyWithBackend(message, '/api/bot/alerts');
      return;
    }

    if (command === '!help') {
      await message.reply(
        [
          'I can check the office without opening the dashboard:',
          '`!status` - live room-by-room device status',
          '`!room work1` - details for one room',
          '`!usage` - current power and today usage',
          '`!alerts` - active alert summary',
        ].join('\n'),
      );
    }
  } catch (error) {
    console.error('[Discord Bot] Command failed:', error);
    await message.reply("I could not reach Voltaire right now. The dashboard backend may still be starting.");
  }
});

function normalizeCommandText(content: string, botUserId?: string) {
  let text = content.trim();
  if (botUserId) {
    text = text.replace(new RegExp(`^<@!?${botUserId}>\\s*`), '');
  }
  return text.trim();
}

async function replyWithBackend(message: { reply: (content: string) => Promise<unknown> }, path: string) {
  const data = await fetchJson<BotResponse>(path);
  await replyInChunks(message, data.message || data.error || 'No summary was returned.');
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`);
  if (!response.ok) {
    throw new Error(`Backend returned ${response.status} for ${path}`);
  }
  return response.json() as Promise<T>;
}

async function replyInChunks(target: { reply: (content: string) => Promise<unknown> }, text: string) {
  for (const chunk of splitDiscordMessage(text)) {
    await target.reply(chunk);
  }
}

function splitDiscordMessage(text: string) {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 1900) {
    const splitAt = remaining.lastIndexOf('\n', 1900);
    const end = splitAt > 0 ? splitAt : 1900;
    chunks.push(remaining.slice(0, end));
    remaining = remaining.slice(end).trimStart();
  }

  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

function startAlertWatcher() {
  void pollAlerts();
  setInterval(() => {
    void pollAlerts();
  }, alertPollMs);
}

async function pollAlerts() {
  try {
    const alerts = await fetchJson<BackendAlert[]>('/api/alerts');

    if (!alertWatcherPrimed) {
      alertWatcherPrimed = true;
      if (!postExistingAlertsOnStartup) {
        for (const alert of alerts) {
          postedAlertIds.add(alert.id);
        }
        console.log(`[Discord Bot] Alert watcher ready. Skipping ${alerts.length} existing alert(s).`);
        return;
      }
    }

    for (const alert of alerts.reverse()) {
      if (postedAlertIds.has(alert.id)) continue;
      postedAlertIds.add(alert.id);
      await postAlert(alert);
    }
  } catch (error) {
    console.error('[Discord Bot] Alert poll failed:', error);
  }
}

async function postAlert(alert: BackendAlert) {
  if (!alertChannelId) return;

  const channel = await client.channels.fetch(alertChannelId);
  if (!channel?.isTextBased() || !('send' in channel)) {
    console.warn('[Discord Bot] Alert channel is not text-based or could not be found.');
    return;
  }

  const severity = alert.severity === 'critical' ? 'Critical' : alert.severity === 'warning' ? 'Heads up' : 'Notice';
  await channel.send(
    [
      `**${severity}: ${alert.title}**`,
      `Hey! ${alert.message}`,
      alert.room ? `Room: ${alert.room}` : undefined,
      `Time: ${new Date(alert.timestamp).toLocaleString()}`,
    ].filter(Boolean).join('\n'),
  );
}

client.login(token).catch((error) => {
  console.error('[Discord Bot] Login failed:', error);
  process.exit(1);
});
