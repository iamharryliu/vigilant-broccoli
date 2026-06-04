'use client';

import { Badge, ScrollArea, Text, TextField } from '@radix-ui/themes';
import { Button, Progress } from '@vigilant-broccoli/react-lib';
import { useEffect, useRef, useState } from 'react';
import { createSoundAlert } from '../audio';

const STORAGE_KEY = 'vb-manager-alarms';
const ALARM_EVENT = 'vb-alarm-state';
const ALARM_COMMAND_EVENT = 'vb-alarm-command';
const CMD_ADD = 'add';
const CMD_TOGGLE = 'toggle';
const CMD_DELETE = 'delete';

interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  triggered: boolean;
  createdAt: number;
}

const readStoredAlarms = (): Alarm[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  const now = Date.now();
  return JSON.parse(stored).map((a: Alarm) => ({
    ...a,
    createdAt: a.createdAt || now,
  }));
};

const emitAlarmState = (alarms: Alarm[]) => {
  window.dispatchEvent(new CustomEvent(ALARM_EVENT, { detail: alarms }));
};

// AlarmEngine: mount once at app level, never unmounts
export const AlarmEngine = () => {
  const alertsRef = useRef<Map<string, ReturnType<typeof createSoundAlert>>>(
    new Map(),
  );
  const alarmsRef = useRef<Alarm[]>([]);

  const saveAndEmit = (alarms: Alarm[]) => {
    alarmsRef.current = alarms;
    if (alarms.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    emitAlarmState(alarms);
  };

  const startAlarmRinging = (alarmId: string) => {
    if (alertsRef.current.has(alarmId)) return;
    const alert = createSoundAlert();
    alert.start();
    alertsRef.current.set(alarmId, alert);
  };

  const stopAlarmRinging = (alarmId: string) => {
    alertsRef.current.get(alarmId)?.stop();
    alertsRef.current.delete(alarmId);
  };

  useEffect(() => {
    alarmsRef.current = readStoredAlarms();
    emitAlarmState(alarmsRef.current);

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      let changed = false;
      const updated = alarmsRef.current.map(alarm => {
        if (alarm.enabled && alarm.time === currentTime && !alarm.triggered) {
          startAlarmRinging(alarm.id);
          changed = true;
          return { ...alarm, triggered: true };
        }
        if (alarm.triggered && alarm.time !== currentTime) {
          stopAlarmRinging(alarm.id);
          changed = true;
          return { ...alarm, triggered: false };
        }
        return alarm;
      });

      if (changed) saveAndEmit(updated);
      else emitAlarmState(alarmsRef.current); // tick for progress bars
    }, 1000);

    const onUICommand = (e: Event) => {
      const { command, payload } = (e as CustomEvent).detail;

      if (command === CMD_ADD) {
        saveAndEmit([...alarmsRef.current, payload as Alarm]);
      }

      if (command === CMD_TOGGLE) {
        const alarm = alarmsRef.current.find(a => a.id === payload);
        if (alarm?.triggered) stopAlarmRinging(payload);
        saveAndEmit(
          alarmsRef.current.map(a =>
            a.id === payload
              ? { ...a, enabled: !a.enabled, triggered: false }
              : a,
          ),
        );
      }

      if (command === CMD_DELETE) {
        const alarm = alarmsRef.current.find(a => a.id === payload);
        if (alarm?.triggered) stopAlarmRinging(payload);
        saveAndEmit(alarmsRef.current.filter(a => a.id !== payload));
      }
    };

    window.addEventListener(ALARM_COMMAND_EVENT, onUICommand);

    return () => {
      clearInterval(interval);
      window.removeEventListener(ALARM_COMMAND_EVENT, onUICommand);
      alertsRef.current.forEach(a => a.stop());
      alertsRef.current.clear();
    };
  }, []);

  return null;
};

const sendCommand = (command: string, payload?: unknown) => {
  window.dispatchEvent(
    new CustomEvent(ALARM_COMMAND_EVENT, { detail: { command, payload } }),
  );
};

export const AlarmUtilityContent = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');

  useEffect(() => {
    setAlarms(readStoredAlarms());

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    const onState = (e: Event) => setAlarms((e as CustomEvent<Alarm[]>).detail);
    window.addEventListener(ALARM_EVENT, onState);
    return () => window.removeEventListener(ALARM_EVENT, onState);
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
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
    sendCommand(CMD_ADD, {
      id: Date.now().toString(),
      time: newTime,
      label: newLabel,
      enabled: true,
      triggered: false,
      createdAt: Date.now(),
    });
    setNewTime('');
    setNewLabel('');
  };

  return (
    <div className="flex flex-col gap-3">
      {notificationPermission !== 'granted' && (
        <div className="flex flex-col gap-2">
          <Text size="2" color="orange">
            Enable notifications for alarm alerts
          </Text>
          <Button size="sm" onClick={requestNotificationPermission}>
            Enable Notifications
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-end">
          <div className="flex flex-col gap-1" style={{ flex: 1 }}>
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
          </div>
          <div className="flex flex-col gap-1" style={{ flex: 2 }}>
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
          </div>
          <Button onClick={handleAddAlarm} disabled={!newTime}>
            Add
          </Button>
        </div>
      </div>

      {alarms.length > 0 && (
        <ScrollArea style={{ maxHeight: '300px' }}>
          <div className="flex flex-col gap-2">
            {alarms.map(alarm => {
              const progress = calculateProgress(alarm);
              return (
                <div className="flex flex-col gap-2 p-2" key={alarm.id} style={{
                    border: '1px solid var(--gray-6)',
                    borderRadius: '4px',
                  }}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Text size="3" weight="bold">
                          {alarm.time}
                        </Text>
                        {!alarm.enabled && <Badge color="gray">Disabled</Badge>}
                        {alarm.triggered && <Badge color="red">Ringing!</Badge>}
                      </div>
                      {alarm.label && (
                        <Text size="2" color="gray">
                          {alarm.label}
                        </Text>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {alarm.triggered ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => sendCommand(CMD_DELETE, alarm.id)}
                        >
                          Stop Alarm
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant={alarm.enabled ? 'secondary' : 'outline'}
                            onClick={() => sendCommand(CMD_TOGGLE, alarm.id)}
                          >
                            {alarm.enabled ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => sendCommand(CMD_DELETE, alarm.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {alarm.enabled && !alarm.triggered && (
                    <div className="flex flex-col gap-1">
                      <Progress value={progress} />
                      <Text size="1" color="gray">
                        {Math.round(progress)}% complete
                      </Text>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {alarms.length === 0 && (
        <Text size="2" color="gray">
          No alarms set
        </Text>
      )}
    </div>
  );
};
