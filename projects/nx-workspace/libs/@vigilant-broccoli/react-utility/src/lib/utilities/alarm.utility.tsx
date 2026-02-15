'use client';

import {
  Badge,
  Button,
  Flex,
  ScrollArea,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'vb-manager-alarms';
const CHECK_INTERVAL_MS = 1000;
const BEEP_DURATION_MS = 500;
const BEEP_INTERVAL_MS = 1000;

interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  triggered: boolean;
  createdAt: number;
}

export const AlarmUtilityContent = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');
  const [, setTick] = useState(0);
  const ringingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedAlarms = JSON.parse(stored);
      const now = Date.now();
      const alarmsWithCreatedAt = parsedAlarms.map((alarm: Alarm) => ({
        ...alarm,
        createdAt: alarm.createdAt || now,
      }));
      setAlarms(alarmsWithCreatedAt);
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
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
      ).padStart(2, '0')}`;

      setTick(prev => prev + 1);

      setAlarms(prevAlarms =>
        prevAlarms.map(alarm => {
          if (alarm.enabled && alarm.time === currentTime && !alarm.triggered) {
            startAlarmRinging(alarm.id);
            showNotification(alarm);
            return { ...alarm, triggered: true };
          }
          if (alarm.time !== currentTime && alarm.triggered) {
            stopAlarmRinging(alarm.id);
            return { ...alarm, triggered: false };
          }
          return alarm;
        }),
      );
    }, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      ringingIntervalsRef.current.forEach(intervalId =>
        clearInterval(intervalId),
      );
      ringingIntervalsRef.current.clear();
    };
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const playBeep = () => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + BEEP_DURATION_MS / 1000,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + BEEP_DURATION_MS / 1000);
  };

  const startAlarmRinging = (alarmId: string) => {
    if (ringingIntervalsRef.current.has(alarmId)) return;

    playBeep();
    const interval = setInterval(() => {
      playBeep();
    }, BEEP_INTERVAL_MS);

    ringingIntervalsRef.current.set(alarmId, interval);
  };

  const stopAlarmRinging = (alarmId: string) => {
    const interval = ringingIntervalsRef.current.get(alarmId);
    if (interval) {
      clearInterval(interval);
      ringingIntervalsRef.current.delete(alarmId);
    }

    setAlarms(prev =>
      prev.map(alarm =>
        alarm.id === alarmId ? { ...alarm, triggered: false } : alarm,
      ),
    );
  };

  const showNotification = (alarm: Alarm) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Alarm', {
        body: alarm.label || `Alarm at ${alarm.time}`,
        icon: '/favicon.ico',
      });
    }
  };

  const calculateProgress = (alarm: Alarm): number => {
    const now = Date.now();
    const [hours, minutes] = alarm.time.split(':').map(Number);

    const alarmDateTime = new Date();
    alarmDateTime.setHours(hours, minutes, 0, 0);

    if (alarmDateTime.getTime() < alarm.createdAt) {
      alarmDateTime.setDate(alarmDateTime.getDate() + 1);
    }

    const totalDuration = alarmDateTime.getTime() - alarm.createdAt;
    const elapsed = now - alarm.createdAt;

    if (elapsed >= totalDuration) return 100;
    if (elapsed <= 0) return 0;

    return (elapsed / totalDuration) * 100;
  };

  const handleAddAlarm = () => {
    if (!newTime) return;

    const alarm: Alarm = {
      id: Date.now().toString(),
      time: newTime,
      label: newLabel,
      enabled: true,
      triggered: false,
      createdAt: Date.now(),
    };

    setAlarms(prev => [...prev, alarm]);
    setNewTime('');
    setNewLabel('');
  };

  const handleToggleAlarm = (id: string) => {
    const alarm = alarms.find(a => a.id === id);
    if (alarm?.triggered) {
      stopAlarmRinging(id);
    }
    setAlarms(prev =>
      prev.map(alarm =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm,
      ),
    );
  };

  const handleDeleteAlarm = (id: string) => {
    const alarm = alarms.find(a => a.id === id);
    if (alarm?.triggered) {
      stopAlarmRinging(id);
    }
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
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
              size="3"
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddAlarm();
              }}
            />
          </Flex>
          <Flex direction="column" gap="1" style={{ flex: 2 }}>
            <Text size="1" color="gray">
              Label
            </Text>
            <TextField.Root
              size="3"
              placeholder="Alarm label"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddAlarm();
              }}
            />
          </Flex>
          <Button size="3" onClick={handleAddAlarm} disabled={!newTime}>
            Add
          </Button>
        </Flex>
      </Flex>

      {alarms.length > 0 && (
        <ScrollArea style={{ maxHeight: '300px' }}>
          <Flex direction="column" gap="2">
            {alarms.map(alarm => {
              const progress = calculateProgress(alarm);
              return (
                <Flex
                  key={alarm.id}
                  direction="column"
                  gap="2"
                  p="2"
                  style={{
                    border: '1px solid var(--gray-6)',
                    borderRadius: '4px',
                  }}
                >
                  <Flex align="center" justify="between">
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
                      {alarm.triggered ? (
                        <Button
                          size="1"
                          color="red"
                          onClick={() => handleDeleteAlarm(alarm.id)}
                        >
                          Stop Alarm
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="1"
                            variant={alarm.enabled ? 'soft' : 'outline'}
                            onClick={() => handleToggleAlarm(alarm.id)}
                          >
                            {alarm.enabled ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            size="1"
                            color="red"
                            variant="soft"
                            onClick={() => handleDeleteAlarm(alarm.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Flex>
                  </Flex>
                  {alarm.enabled && !alarm.triggered && (
                    <Flex direction="column" gap="1">
                      <div
                        style={{
                          width: '100%',
                          height: '4px',
                          backgroundColor: 'var(--gray-5)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: 'var(--accent-9)',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <Text size="1" color="gray">
                        {Math.round(progress)}% complete
                      </Text>
                    </Flex>
                  )}
                </Flex>
              );
            })}
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
