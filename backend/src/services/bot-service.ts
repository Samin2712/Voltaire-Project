import { getAllDevices, getTotalPower, getDevicesByRoom } from '../data/devices.js';
import { getActiveAlerts } from '../data/alerts.js';
import { getTodayKWh } from '../data/usage.js';
import { ROOMS } from '../types/index.js';
import { config } from '../config/index.js';
import { formatWatts, formatDuration, findRoomByName } from '../utils/helpers.js';

/**
 * Human-friendly office status summary for Discord bot.
 */
export function getOfficeStatus(): string {
  const devices = getAllDevices();
  const onDevices = devices.filter((d) => d.status === 'on');
  const totalPower = getTotalPower();
  const todayKWh = getTodayKWh();
  const bill = +(todayKWh * config.billing.ratePerKWh).toFixed(2);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';

  const lines = [
    `${greeting}! Here's your Voltaire office snapshot:`,
    ``,
    `⚡ **${onDevices.length}** out of **${devices.length}** devices are currently running`,
    `🔌 Total power draw: **${formatWatts(totalPower)}**`,
    `📊 Energy used today: **${todayKWh.toFixed(2)} kWh**`,
    `💰 Estimated bill so far: **৳${bill}**`,
    ``,
  ];

  // Per-room summary
  for (const room of ROOMS) {
    const roomDevices = devices.filter((d) => d.roomId === room.id);
    const on = roomDevices.filter((d) => d.status === 'on');
    const fans = on.filter((d) => d.type === 'fan').length;
    const lights = on.filter((d) => d.type === 'light').length;
    const power = on.reduce((s, d) => s + d.powerDraw, 0);

    const parts: string[] = [];
    if (fans > 0) parts.push(`${fans} fan${fans > 1 ? 's' : ''}`);
    if (lights > 0) parts.push(`${lights} light${lights > 1 ? 's' : ''}`);

    if (parts.length > 0) {
      lines.push(`🏢 **${room.name}**: ${parts.join(' and ')} running (${formatWatts(power)})`);
    } else {
      lines.push(`🏢 **${room.name}**: All devices off 💤`);
    }
  }

  return lines.join('\n');
}

/**
 * Human-friendly room summary for Discord bot.
 */
export function getRoomSummary(roomName: string): string {
  const room = findRoomByName(roomName);
  if (!room) {
    return `❌ I couldn't find a room called "${roomName}". Available rooms: ${ROOMS.map((r) => r.name).join(', ')}`;
  }

  const devices = getDevicesByRoom(room.id);
  const onDevices = devices.filter((d) => d.status === 'on');
  const fans = onDevices.filter((d) => d.type === 'fan');
  const lights = onDevices.filter((d) => d.type === 'light');
  const power = onDevices.reduce((s, d) => s + d.powerDraw, 0);
  const totalEnergy = devices.reduce((s, d) => s + d.energyUsedToday, 0);

  const lines = [
    `📍 **${room.name}** — ${room.description}`,
    ``,
  ];

  if (onDevices.length === 0) {
    lines.push(`All devices are currently **off**. The room is idle 💤`);
  } else {
    const parts: string[] = [];
    if (fans.length > 0) parts.push(`${fans.length} fan${fans.length > 1 ? 's' : ''}`);
    if (lights.length > 0) parts.push(`${lights.length} light${lights.length > 1 ? 's' : ''}`);
    lines.push(`${parts.join(' and ')} running right now.`);
    lines.push(`⚡ Current power usage: **${formatWatts(power)}**`);
  }

  lines.push(`📊 Energy used today: **${totalEnergy.toFixed(3)} kWh**`);
  lines.push(`🔧 Devices: ${devices.length} total (${onDevices.length} on, ${devices.length - onDevices.length} off)`);

  // List each device
  lines.push(``);
  for (const d of devices) {
    const icon = d.type === 'fan' ? '🌀' : '💡';
    const statusIcon = d.status === 'on' ? '🟢' : '⚪';
    lines.push(`${icon} ${statusIcon} ${d.name} — ${d.status === 'on' ? formatWatts(d.powerDraw) : 'Off'} (runtime: ${formatDuration(d.runtimeToday)})`);
  }

  return lines.join('\n');
}

/**
 * Human-friendly usage summary for Discord bot.
 */
export function getUsageSummary(): string {
  const totalPower = getTotalPower();
  const todayKWh = getTodayKWh();
  const bill = +(todayKWh * config.billing.ratePerKWh).toFixed(2);

  const lines = [
    `📊 **Energy Usage Summary**`,
    ``,
    `⚡ Current power draw: **${formatWatts(totalPower)}**`,
    `📈 Energy consumed today: **${todayKWh.toFixed(2)} kWh**`,
    `💰 Estimated bill: **৳${bill}**`,
    `💡 Rate: ৳${config.billing.ratePerKWh}/kWh`,
    ``,
  ];

  // Room breakdown
  lines.push(`**Per-room breakdown:**`);
  for (const room of ROOMS) {
    const devices = getDevicesByRoom(room.id);
    const on = devices.filter((d) => d.status === 'on');
    const power = on.reduce((s, d) => s + d.powerDraw, 0);
    const energy = devices.reduce((s, d) => s + d.energyUsedToday, 0);
    lines.push(`• ${room.name}: ${formatWatts(power)} (${energy.toFixed(3)} kWh today)`);
  }

  return lines.join('\n');
}

/**
 * Human-friendly alerts summary for Discord bot.
 */
export function getAlertsSummary(): string {
  const alerts = getActiveAlerts();

  if (alerts.length === 0) {
    return `✅ **All clear!** No active alerts right now. Your office is running smoothly.`;
  }

  const critical = alerts.filter((a) => a.severity === 'critical');
  const warning = alerts.filter((a) => a.severity === 'warning');
  const info = alerts.filter((a) => a.severity === 'info');

  const lines = [
    `🔔 **${alerts.length} Active Alert${alerts.length > 1 ? 's' : ''}**`,
    ``,
  ];

  if (critical.length > 0) {
    lines.push(`🔴 **Critical (${critical.length}):**`);
    for (const a of critical) {
      lines.push(`  • ${a.title}: ${a.message}`);
    }
  }

  if (warning.length > 0) {
    lines.push(`🟡 **Warning (${warning.length}):**`);
    for (const a of warning) {
      lines.push(`  • ${a.title}: ${a.message}`);
    }
  }

  if (info.length > 0) {
    lines.push(`🔵 **Info (${info.length}):**`);
    for (const a of info) {
      lines.push(`  • ${a.title}: ${a.message}`);
    }
  }

  return lines.join('\n');
}
