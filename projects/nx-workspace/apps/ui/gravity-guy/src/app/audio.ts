'use client';

import { useCallback, useEffect, useRef } from 'react';

const TRACKS = [
  {
    tempo: 112,
    roots: [45, 41, 48, 43],
    melody: [12, 19, 24, 27, 19, 24, 15, 19],
    chord: [12, 15, 19],
  },
  {
    tempo: 136,
    roots: [38, 34, 41, 36],
    melody: [24, 31, 36, 39, 31, 36, 27, 31],
    chord: [12, 15, 19, 24],
  },
  {
    tempo: 76,
    roots: [48, 45, 41, 43],
    melody: [12, 16, 19, 24, 19, 16, 14, 19],
    chord: [12, 16, 19],
  },
] as const;
const frequencyOf = (note: number) => 440 * 2 ** ((note - 69) / 12);
const noiseBuffer = (context: AudioContext) => {
  const buffer = context.createBuffer(
    1,
    Math.ceil(context.sampleRate * 0.28),
    context.sampleRate,
  );
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  return buffer;
};
const synthNote = (
  context: AudioContext,
  output: AudioNode,
  note: number,
  time: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'triangle',
  attack = 0.025,
) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequencyOf(note), time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(
    volume,
    time + Math.min(attack, duration / 4),
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  oscillator.connect(gain).connect(output);
  oscillator.start(time);
  oscillator.stop(time + duration);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
};
const sequenceStep = (
  context: AudioContext,
  output: AudioNode,
  noise: AudioBuffer,
  step: number,
  time: number,
  trackNumber: number,
) => {
  const track = TRACKS[trackNumber];
  const calm = trackNumber === 2;
  const epic = trackNumber === 1;
  const root = track.roots[Math.floor(step / 16) % 4];
  const interval = track.melody[(calm ? Math.floor(step / 2) : step) % 8];
  if (!calm || step % 2 === 0)
    synthNote(
      context,
      output,
      root + interval,
      time,
      calm ? 0.7 : 0.21,
      calm ? 0.03 : 0.035,
      calm ? 'sine' : 'triangle',
    );
  if (step % (calm ? 8 : 4) === 0)
    synthNote(
      context,
      output,
      root,
      time,
      calm ? 1.2 : 0.42,
      calm ? 0.03 : 0.07,
      'sine',
    );
  if (!calm && step % (epic ? 2 : 4) === 0) {
    const kick = context.createOscillator();
    const gain = context.createGain();
    kick.frequency.setValueAtTime(110, time);
    kick.frequency.exponentialRampToValueAtTime(38, time + 0.13);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
    kick.connect(gain).connect(output);
    kick.start(time);
    kick.stop(time + 0.15);
    kick.onended = () => {
      kick.disconnect();
      gain.disconnect();
    };
  }
  if (!calm && step % 2 === 1) {
    const hat = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    hat.buffer = noise;
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    gain.gain.setValueAtTime(0.025, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
    hat.connect(filter).connect(gain).connect(output);
    hat.start(time);
    hat.stop(time + 0.05);
    hat.onended = () => {
      hat.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }
  if (step % 16 === 0)
    for (const interval of track.chord)
      synthNote(
        context,
        output,
        root + interval,
        time,
        (60 / track.tempo / 2) * 15,
        0.018,
        epic ? 'triangle' : 'sine',
        calm ? 0.7 : 0.25,
      );
};

export const useGameAudio = (
  active: boolean,
  music: boolean,
  sounds: boolean,
  seed: number,
) => {
  const context = useRef<AudioContext | null>(null);
  const noise = useRef<AudioBuffer | null>(null);
  const unlock = useCallback(() => {
    if (!window.AudioContext) return;
    context.current ??= new AudioContext();
    noise.current ??= noiseBuffer(context.current);
    if (context.current.state === 'suspended')
      void context.current.resume().catch(() => undefined);
  }, []);
  const playDash = useCallback(() => {
    if (!sounds) return;
    unlock();
    const audio = context.current;
    if (!audio || !noise.current) return;
    const time = audio.currentTime;
    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    source.buffer = noise.current;
    filter.type = 'bandpass';
    filter.Q.value = 0.5;
    filter.frequency.setValueAtTime(3800, time);
    filter.frequency.exponentialRampToValueAtTime(650, time + 0.23);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.32, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);
    source.connect(filter).connect(gain).connect(audio.destination);
    source.start(time);
    source.stop(time + 0.25);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }, [sounds, unlock]);

  const playWoof = useCallback(() => {
    const audio = context.current;
    if (
      !active ||
      !sounds ||
      !audio ||
      audio.state !== 'running' ||
      !noise.current
    )
      return;
    const time = audio.currentTime;
    const voice = audio.createOscillator();
    const breath = audio.createBufferSource();
    const breathGain = audio.createGain();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    voice.type = 'sawtooth';
    voice.frequency.setValueAtTime(165, time);
    voice.frequency.exponentialRampToValueAtTime(78, time + 0.19);
    breath.buffer = noise.current;
    breathGain.gain.value = 0.28;
    filter.type = 'bandpass';
    filter.Q.value = 1.1;
    filter.frequency.setValueAtTime(850, time);
    filter.frequency.exponentialRampToValueAtTime(380, time + 0.2);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.34, time + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.18, time + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    voice.connect(filter);
    breath.connect(breathGain).connect(filter);
    filter.connect(gain).connect(audio.destination);
    voice.start(time);
    breath.start(time);
    voice.stop(time + 0.23);
    breath.stop(time + 0.23);
    voice.onended = () => {
      voice.disconnect();
      breath.disconnect();
      breathGain.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }, [active, sounds]);

  const playPlatform = useCallback(
    (effect: 'boost' | 'slow') => {
      if (!sounds) return;
      unlock();
      const audio = context.current;
      if (!audio) return;
      const notes = effect === 'boost' ? [64, 71, 76] : [57, 50, 45];
      for (const [index, note] of notes.entries())
        synthNote(
          audio,
          audio.destination,
          note,
          audio.currentTime + index * 0.055,
          0.13,
          0.065,
          effect === 'boost' ? 'triangle' : 'sine',
        );
    },
    [sounds, unlock],
  );

  useEffect(() => {
    const audio = context.current;
    const buffer = noise.current;
    if (!active || !music || !audio || !buffer) return;
    const bus = audio.createGain();
    bus.gain.value = 0.55;
    bus.connect(audio.destination);
    const trackNumber = seed % TRACKS.length;
    const stepDuration = 60 / TRACKS[trackNumber].tempo / 2;
    let step = 0;
    let nextAt = audio.currentTime + 0.03;
    const schedule = () => {
      // A short lookahead keeps browser timer jitter out of the musical rhythm.
      while (nextAt < audio.currentTime + 0.12) {
        sequenceStep(audio, bus, buffer, step, nextAt, trackNumber);
        step = (step + 1) % 64;
        nextAt += stepDuration;
      }
    };
    schedule();
    const timer = window.setInterval(schedule, 40);
    return () => {
      window.clearInterval(timer);
      bus.gain.cancelScheduledValues(audio.currentTime);
      bus.gain.setTargetAtTime(0, audio.currentTime, 0.015);
      window.setTimeout(() => bus.disconnect(), 80);
    };
  }, [active, music, seed]);
  useEffect(
    () => () => {
      const audio = context.current;
      context.current = null;
      noise.current = null;
      if (audio && audio.state !== 'closed')
        void audio.close().catch(() => undefined);
    },
    [],
  );
  return { unlock, playDash, playPlatform, playWoof };
};
