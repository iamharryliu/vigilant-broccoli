'use client';

import { Badge, Button, Flex, ScrollArea, Text, TextField } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'vb-manager-alarms';
const CHECK_INTERVAL_MS = 1000;

interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  triggered: boolean;
}

export const AlarmUtilityContent = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setAlarms(JSON.parse(stored));
    }

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (alarms.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    }
  }, [alarms]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setAlarms((prevAlarms) =>
        prevAlarms.map((alarm) => {
          if (alarm.enabled && alarm.time === currentTime && !alarm.triggered) {
            playAlarmSound();
            showNotification(alarm);
            return { ...alarm, triggered: true };
          }
          if (alarm.time !== currentTime && alarm.triggered) {
            return { ...alarm, triggered: false };
          }
          return alarm;
        })
      );
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const playAlarmSound = () => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const showNotification = (alarm: Alarm) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Alarm', {
        body: alarm.label || `Alarm at ${alarm.time}`,
        icon: '/favicon.ico',
      });
    }
  };

  const handleAddAlarm = () => {
    if (!newTime) return;

    const alarm: Alarm = {
      id: Date.now().toString(),
      time: newTime,
      label: newLabel,
      enabled: true,
      triggered: false,
    };

    setAlarms((prev) => [...prev, alarm]);
    setNewTime('');
    setNewLabel('');
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) => prev.map((alarm) => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm)));
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
    if (alarms.length === 1) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <Flex direction="column" gap="3">
      {notificationPermission !== 'granted' && (
        <Flex direction="column" gap="2">
          <Text size="2" color="orange">
            Enable notifications for alarm alerts
          </Text>
          <Button size="1" onClick={requestNotificationPermission}>
            Enable Notifications
          </Button>
        </Flex>
      )}

      <Flex direction="column" gap="2">
        <Flex gap="2" align="end">
          <Flex direction="column" gap="1" style={{ flex: 1 }}>
            <Text size="1" color="gray">
              Time
            </Text>
            <TextField.Root
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddAlarm();
              }}
            />
          </Flex>
          <Flex direction="column" gap="1" style={{ flex: 2 }}>
            <Text size="1" color="gray">
              Label
            </Text>
            <TextField.Root
              placeholder="Alarm label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddAlarm();
              }}
            />
          </Flex>
          <Button size="2" onClick={handleAddAlarm} disabled={!newTime}>
            Add
          </Button>
        </Flex>
      </Flex>

      {alarms.length > 0 && (
        <ScrollArea style={{ maxHeight: '300px' }}>
          <Flex direction="column" gap="2">
            {alarms.map((alarm) => (
              <Flex key={alarm.id} align="center" justify="between" p="2" style={{ border: '1px solid var(--gray-6)', borderRadius: '4px' }}>
                <Flex direction="column" gap="1">
                  <Flex align="center" gap="2">
                    <Text size="3" weight="bold">
                      {alarm.time}
                    </Text>
                    {!alarm.enabled && <Badge color="gray">Disabled</Badge>}
                    {alarm.triggered && <Badge color="red">Ringing!</Badge>}
                  </Flex>
                  {alarm.label && (
                    <Text size="2" color="gray">
                      {alarm.label}
                    </Text>
                  )}
                </Flex>
                <Flex gap="2">
                  <Button size="1" variant={alarm.enabled ? 'soft' : 'outline'} onClick={() => handleToggleAlarm(alarm.id)}>
                    {alarm.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="1" color="red" variant="soft" onClick={() => handleDeleteAlarm(alarm.id)}>
                    Delete
                  </Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </ScrollArea>
      )}

      {alarms.length === 0 && (
        <Text size="2" color="gray">
          No alarms set
        </Text>
      )}
    </Flex>
  );
};
