import { getAllDevices, getDevicesByRoom, toggleDevice, updateDevice, tickRuntime, getTotalPower, getRoomPower } from '../data/devices.js';
import { addActivity } from '../data/activity.js';
import { recordPowerSample, updateDailyUsage } from '../data/usage.js';
import { runAlertEngine } from '../services/alert-service.js';
import { getDevices, getRoomSummaries, getUsageData, getDashboardStats } from '../services/device-service.js';
import { emitDeviceUpdate, emitUsageUpdate, emitRoomUpdate, emitAlertNew, emitActivityNew, emitDashboardUpdate } from '../socket/socket-manager.js';
import { config } from '../config/index.js';
import { ROOMS } from '../types/index.js';
import { isOfficeHours, randomInt, randomPick, chance, nowISO, roomNameFromId } from '../utils/helpers.js';

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let tickCount = 0;

/** Start the device simulator. */
export function startSimulator(): void {
  if (intervalHandle) {
    console.warn('[Simulator] Already running.');
    return;
  }

  const intervalMs = config.simulator.intervalMs;
  const intervalSeconds = intervalMs / 1000;

  console.log(`[Simulator] Starting with ${intervalMs}ms interval...`);

  intervalHandle = setInterval(() => {
    try {
      tick(intervalSeconds);
    } catch (err) {
      console.error('[Simulator] Tick error:', err);
    }
  }, intervalMs);

  // Run initial tick
  tick(intervalSeconds);
}

/** Stop the simulator. */
export function stopSimulator(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('[Simulator] Stopped.');
  }
}

/** Single simulator tick. */
function tick(intervalSeconds: number): void {
  tickCount++;
  const devices = getAllDevices();
  const officeHours = isOfficeHours();

  // 1. Decide how many devices to toggle this tick
  let toggleCount = 0;

  if (officeHours) {
    // During office hours: occasionally toggle 1-2 devices
    if (chance(0.6)) toggleCount = randomInt(1, 2);
  } else {
    // After hours: less frequent toggles
    if (chance(0.3)) toggleCount = 1;
  }

  // Occasional spike scenario (5% chance): toggle 3-4 devices ON
  const isSpike = chance(0.05);
  if (isSpike) toggleCount = randomInt(3, 4);

  // 2. Toggle random devices
  for (let i = 0; i < toggleCount; i++) {
    const device = randomPick(devices);

    // Determine desired state based on time of day
    let targetStatus: 'on' | 'off';

    if (isSpike) {
      // Spike: force ON
      targetStatus = 'on';
    } else if (officeHours) {
      // Office hours: bias toward ON (70% on, 30% off)
      targetStatus = chance(0.7) ? 'on' : 'off';
    } else {
      // After hours: bias toward OFF (20% on, 80% off)
      // But sometimes "forget" to turn off (15% chance stays on)
      targetStatus = chance(0.15) ? 'on' : 'off';
    }

    // Only toggle if state would change
    if (device.status !== targetStatus) {
      const updated = toggleDevice(device.id);
      if (updated) {
        const activity = addActivity({
          message: `${updated.name} in ${updated.room} turned ${updated.status.toUpperCase()}`,
          deviceId: updated.id,
          room: updated.roomId,
          kind: updated.status as 'on' | 'off',
        });
        emitActivityNew(activity);
      }
    }
  }

  // 3. Update runtime and energy for all ON devices
  tickRuntime(intervalSeconds);

  // 4. Record power sample
  const totalPower = getTotalPower();
  const roomPowers = {
    drawing: getRoomPower('drawing-room'),
    work1: getRoomPower('work-room-1'),
    work2: getRoomPower('work-room-2'),
  };

  recordPowerSample({
    total: totalPower,
    drawing: roomPowers.drawing,
    work1: roomPowers.work1,
    work2: roomPowers.work2,
  });

  // 5. Update daily usage tracking
  updateDailyUsage(totalPower);

  // 6. Run alert engine
  const newAlerts = runAlertEngine();
  for (const alert of newAlerts) {
    emitAlertNew(alert);
  }

  // 7. Emit real-time updates to connected clients
  const updatedDevices = getDevices();
  emitDeviceUpdate(updatedDevices);
  emitUsageUpdate(getUsageData());
  emitRoomUpdate(getRoomSummaries());
  emitDashboardUpdate(getDashboardStats());

  // Log every 12th tick (~1 minute at 5s interval)
  if (tickCount % 12 === 0) {
    const onCount = updatedDevices.filter((d) => d.status === 'on').length;
    console.log(
      `[Simulator] Tick #${tickCount} | ${onCount}/${updatedDevices.length} devices ON | ${Math.round(totalPower)}W | ${newAlerts.length} new alerts | ${officeHours ? 'Office hours' : 'After hours'}`
    );
  }
}
