import { MATCH_EVENT } from './engine/game.consts';
import { MatchEvent } from './engine/game.types';

const MAX_VOICES = 6;
const SILENT_GAIN = 0.001;
const VOLUME = 0.12;
const EFFECT = {
  [MATCH_EVENT.POP]: {
    duration: 0.18,
    frequency: 850,
    endFrequency: 100,
    noise: true,
  },
  [MATCH_EVENT.PICKUP]: {
    duration: 0.16,
    frequency: 620,
    endFrequency: 1240,
    noise: false,
  },
  [MATCH_EVENT.SPLASH]: {
    duration: 0.35,
    frequency: 1800,
    endFrequency: 350,
    noise: true,
  },
} as const;

export const createGameAudio = () => {
  let context: AudioContext | null = null;
  const voices = new Set<AudioBufferSourceNode | OscillatorNode>();

  const unlock = () => {
    try {
      context ??= new AudioContext();
      if (context.state === 'suspended')
        void context.resume().catch(() => undefined);
    } catch {
      context = null;
    }
  };

  const silence = () => {
    voices.forEach(source => source.stop());
    voices.clear();
  };

  const play = (type: MatchEvent['type']) => {
    if (!context || context.state !== 'running' || voices.size >= MAX_VOICES)
      return;
    const effect = EFFECT[type];
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(VOLUME, now);
    gain.gain.exponentialRampToValueAtTime(SILENT_GAIN, now + effect.duration);
    gain.connect(context.destination);

    let source: AudioBufferSourceNode | OscillatorNode;
    if (effect.noise) {
      const buffer = context.createBuffer(
        1,
        Math.ceil(context.sampleRate * effect.duration),
        context.sampleRate,
      );
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++)
        samples[i] = Math.random() * 2 - 1;
      const noise = context.createBufferSource();
      noise.buffer = buffer;
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(effect.frequency, now);
      filter.frequency.exponentialRampToValueAtTime(
        effect.endFrequency,
        now + effect.duration,
      );
      noise.connect(filter);
      filter.connect(gain);
      source = noise;
    } else {
      const tone = context.createOscillator();
      tone.type = 'sine';
      tone.frequency.setValueAtTime(effect.frequency, now);
      tone.frequency.exponentialRampToValueAtTime(
        effect.endFrequency,
        now + effect.duration,
      );
      tone.connect(gain);
      source = tone;
    }
    voices.add(source);
    source.onended = () => {
      voices.delete(source);
      source.disconnect();
      gain.disconnect();
    };
    source.start(now);
    source.stop(now + effect.duration);
  };

  const close = () => {
    silence();
    if (context) void context.close().catch(() => undefined);
    context = null;
  };

  return { unlock, play, silence, close };
};
