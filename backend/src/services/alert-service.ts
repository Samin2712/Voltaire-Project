import { getAllDevices, getTotalPower } from '../data/devices.js';
import { createAlert, alertExists, resolveAlertsByTypeAndRoom, cleanupOldAlerts } from '../data/alerts.js';
import { addActivity } from '../data/activity.js';
import { ROOMS } from '../types/index.js';
import type { Alert, Device } from '../types/index.js';
import { config } from '../config/index.js';
import { isOfficeHours, roomNameFromId } from '../utils/helpers.js';

let previousTotalPower = 0;

/** Run the alert engine. Returns any newly created alerts. */
export function runAlertEngine(): Alert[] {
  const devices = getAllDevices();
  const now = new Date();
  const newAlerts: Alert[] = [];

  // 1. After-hours alerts
  if (!isOfficeHours(now)) {
    for (const room of ROOMS) {
      const roomDevices = devices.filter((d) => d.roomId === room.id);
      const onDevices = roomDevices.filter((d) => d.status === 'on');

      if (onDevices.length > 0 && !alertExists('after-hours', room.id)) {
        const alert = createAlert({
          type: 'after-hours',
          severity: 'critical',
          title: `After-hours activity in ${room.name}`,
          message: `${onDevices.length} device(s) still running outside ${config.officeHours.start}AM–${config.officeHours.end > 12 ? config.officeHours.end - 12 : config.officeHours.end}PM office hours.`,
          room: room.id,
        });
        newAlerts.push(alert);

        addActivity({
          message: `⚠️ Alert: ${onDevices.length} devices still on in ${room.name} after hours`,
          room: room.id,
          kind: 'alert',
        });
      }
    }
  } else {
    // Resolve after-hours alerts during office hours
    for (const room of ROOMS) {
      resolveAlertsByTypeAndRoom('after-hours', room.id);
    }
  }

  // 2. Full room alerts (all 5 devices ON for extended period)
  for (const room of ROOMS) {
    const roomDevices = devices.filter((d) => d.roomId === room.id);
    const onDevices = roomDevices.filter((d) => d.status === 'on');

    if (onDevices.length === roomDevices.length && roomDevices.length > 0) {
      // Check if devices have been on for >2 hours (7200 seconds)
      const allOnLongEnough = onDevices.every((d) => d.runtimeToday > 7200);

      if (allOnLongEnough && !alertExists('full-room', room.id)) {
        const alert = createAlert({
          type: 'full-room',
          severity: 'warning',
          title: `${room.name} fully active`,
          message: `All ${roomDevices.length} devices in ${room.name} have been ON for over 2 hours. Consider automating shutoff.`,
          room: room.id,
        });
        newAlerts.push(alert);

        addActivity({
          message: `⚠️ Alert: All devices in ${room.name} running for 2+ hours`,
          room: room.id,
          kind: 'alert',
        });
      }
    } else {
      // Resolve full-room alerts when not all devices are on
      resolveAlertsByTypeAndRoom('full-room', room.id);
    }
  }

  // 3. High power usage
  const totalPower = getTotalPower();
  if (totalPower > config.thresholds.highPower && !alertExists('high-power')) {
    const alert = createAlert({
      type: 'high-power',
      severity: 'warning',
      title: 'High office power draw',
      message: `Current draw is ${Math.round(totalPower)}W — above your ${config.thresholds.highPower}W threshold.`,
    });
    newAlerts.push(alert);

    addActivity({
      message: `⚠️ Alert: Total power ${Math.round(totalPower)}W exceeds ${config.thresholds.highPower}W threshold`,
      kind: 'alert',
    });
  }

  // 4. Power spike detection
  if (previousTotalPower > 0) {
    const diff = totalPower - previousTotalPower;
    if (diff > config.thresholds.spike && !alertExists('spike')) {
      const alert = createAlert({
        type: 'spike',
        severity: 'info',
        title: `Unusual spike detected`,
        message: `Power drew +${Math.round(diff)}W suddenly (${Math.round(previousTotalPower)}W → ${Math.round(totalPower)}W). Auto-monitoring.`,
      });
      newAlerts.push(alert);

      addActivity({
        message: `⚡ Spike detected: +${Math.round(diff)}W sudden increase`,
        kind: 'alert',
      });
    }
  }
  previousTotalPower = totalPower;

  // Periodic cleanup
  if (Math.random() < 0.01) {
    cleanupOldAlerts();
  }

  return newAlerts;
}
