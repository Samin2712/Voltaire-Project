import { Router } from 'express';
import { getDevices, getDevice, toggle } from '../services/device-service.js';
import { updateDeviceStatus } from '../data/devices.js';
import { addActivity } from '../data/activity.js';
import { emitDeviceUpdate, emitActivityNew, emitUsageUpdate, emitDashboardUpdate } from '../socket/socket-manager.js';
import { getUsageData, getDashboardStats } from '../services/device-service.js';

const router = Router();

/** GET /api/devices — Get all devices. */
router.get('/devices', (_req, res) => {
  try {
    const devices = getDevices();
    res.json(devices);
  } catch (err) {
    console.error('GET /api/devices error:', err);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

/** GET /api/devices/:id — Get single device. */
router.get('/devices/:id', (req, res) => {
  try {
    const device = getDevice(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (err) {
    console.error('GET /api/devices/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

/** PATCH /api/devices/:id/toggle — Toggle device ON/OFF. */
router.patch('/devices/:id/toggle', (req, res) => {
  try {
    const device = toggle(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Log activity
    const activity = addActivity({
      message: `${device.name} in ${device.room} turned ${device.status.toUpperCase()} (manual)`,
      deviceId: device.id,
      room: device.roomId,
      kind: device.status as 'on' | 'off',
    });

    // Emit real-time updates
    emitDeviceUpdate(getDevices());
    emitActivityNew(activity);
    emitUsageUpdate(getUsageData());
    emitDashboardUpdate(getDashboardStats());

    res.json(device);
  } catch (err) {
    console.error('PATCH /api/devices/:id/toggle error:', err);
    res.status(500).json({ error: 'Failed to toggle device' });
  }
});

/** PATCH /api/devices/:id — Update device status manually. */
router.patch('/devices/:id', (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['on', 'off'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "on" or "off".' });
    }

    const device = updateDeviceStatus(req.params.id, status);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Log activity
    const activity = addActivity({
      message: `${device.name} in ${device.room} set to ${device.status.toUpperCase()} (manual)`,
      deviceId: device.id,
      room: device.roomId,
      kind: device.status as 'on' | 'off',
    });

    // Emit real-time updates
    emitDeviceUpdate(getDevices());
    emitActivityNew(activity);
    emitUsageUpdate(getUsageData());
    emitDashboardUpdate(getDashboardStats());

    res.json(device);
  } catch (err) {
    console.error('PATCH /api/devices/:id error:', err);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

export default router;
