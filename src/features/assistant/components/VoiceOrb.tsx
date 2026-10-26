import { useEffect, useRef } from 'react';

import { cn } from '@/lib/cn';

import type { VoicePhase } from '../hooks/useAssistantChat';

interface VoiceOrbProps {
  phase: VoicePhase;
  /** Goes up at each word heard or spoken; each change swells the orb for a moment. */
  pulse: number;
  small?: boolean;
}

/**
 * The circle at the centre of a voice conversation: it breathes while
 * listening, swirls while looking something up, and pulses while speaking.
 * The look lives in `styles/index.css` (`.voice-orb`).
 */
export function VoiceOrb({ phase, pulse, small = false }: VoiceOrbProps) {
  const orb = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = orb.current;
    if (!element || pulse === 0) return;
    element.style.setProperty('--bump', phase === 'speaking' ? '0.07' : '0.05');
    const timer = window.setTimeout(() => element.style.setProperty('--bump', '0'), 140);
    return () => window.clearTimeout(timer);
  }, [pulse, phase]);

  return (
    <div
      ref={orb}
      className={cn('voice-orb', small && 'voice-orb--small')}
      data-state={phase}
      aria-hidden
    >
      <div className="voice-orb__glow" />
      <div className="voice-orb__ring" />
      <div className="voice-orb__ring voice-orb__ring--late" />
      <div className="voice-orb__core">
        <div className="voice-orb__swirl" />
      </div>
    </div>
  );
}
