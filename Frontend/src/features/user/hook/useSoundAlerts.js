import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * useSoundAlerts — Web Audio API sound system.
 * No external packages needed — uses browser's built-in AudioContext.
 */
export function useSoundAlerts() {
  const ctxRef  = useRef(null);
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem('frameout_sound_muted') === 'true'; } catch { return false; }
  });

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(m => {
      const next = !m;
      try { localStorage.setItem('frameout_sound_muted', String(next)); } catch {}
      return next;
    });
  }, []);

  /**
   * Play a sequence of tones.
   * @param {Array<{freq, duration, gain, type}>} notes
   */
  const playSequence = useCallback((notes) => {
    if (muted) return;
    try {
      const ctx = getCtx();
      let startTime = ctx.currentTime;

      notes.forEach(({ freq = 440, duration = 0.15, gain = 0.3, type = 'sine' }) => {
        const osc     = ctx.createOscillator();
        const gainNode= ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type      = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);

        startTime += duration;
      });
    } catch (e) {
      console.warn('Sound error:', e);
    }
  }, [muted, getCtx]);

  /** Pomodoro session complete — warm success chime */
  const playComplete = useCallback(() => {
    playSequence([
      { freq: 523.25, duration: 0.18, gain: 0.4 },  // C5
      { freq: 659.25, duration: 0.18, gain: 0.4 },  // E5
      { freq: 783.99, duration: 0.18, gain: 0.4 },  // G5
      { freq: 1046.5, duration: 0.35, gain: 0.35 }, // C6 (hold)
    ]);
  }, [playSequence]);

  /** Break time — gentle two-tone */
  const playBreakStart = useCallback(() => {
    playSequence([
      { freq: 440, duration: 0.2, gain: 0.25 },
      { freq: 523, duration: 0.2, gain: 0.25 },
    ]);
  }, [playSequence]);

  /** Tick — subtle click (for last 5 seconds) */
  const playTick = useCallback(() => {
    playSequence([
      { freq: 880, duration: 0.05, gain: 0.15, type: 'square' },
    ]);
  }, [playSequence]);

  /** Level up! — triumphant fanfare */
  const playLevelUp = useCallback(() => {
    playSequence([
      { freq: 523, duration: 0.1, gain: 0.4 },
      { freq: 659, duration: 0.1, gain: 0.4 },
      { freq: 784, duration: 0.1, gain: 0.4 },
      { freq: 1047,duration: 0.1, gain: 0.4 },
      { freq: 1319,duration: 0.3, gain: 0.5 },
    ]);
  }, [playSequence]);

  /** Mission complete — snappy */
  const playMissionComplete = useCallback(() => {
    playSequence([
      { freq: 698, duration: 0.12, gain: 0.3 },
      { freq: 880, duration: 0.2,  gain: 0.35 },
    ]);
  }, [playSequence]);

  // Cleanup
  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return { muted, toggleMute, playComplete, playBreakStart, playTick, playLevelUp, playMissionComplete };
}
