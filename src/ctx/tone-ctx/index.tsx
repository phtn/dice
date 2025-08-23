"use client";

import {
  createContext,
  useMemo,
  useContext,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import * as Tone from "tone";

interface ToneProviderProps {
  children: ReactNode;
}

interface ToneCtxValues {
  playTone: VoidFunction;
}

const ToneCtx = createContext<ToneCtxValues | null>(null);

const ToneCtxProvider = ({ children }: ToneProviderProps) => {
  const [synth, setSynth] = useState<Tone.Synth | null>(null);

  useEffect(() => {
    // Only initialize synth on client after mount
    const s = new Tone.Synth().toDestination();
    setSynth(s);
    return () => {
      s.dispose();
    };
  }, []);

  const playTone = useCallback(async () => {
    await Tone.start(); // unlocks Tone.js' own AudioContext

    const now = Tone.now();
    synth?.triggerAttackRelease("C4", "8n", now);
    synth?.triggerAttackRelease("E4", "8n", now + 0.5);
  }, [synth]);

  const value = useMemo(() => ({ playTone }), [playTone]);

  return <ToneCtx.Provider value={value}>{children}</ToneCtx.Provider>;
};

const useToneCtx = () => {
  const ctx = useContext(ToneCtx);
  if (!ctx) throw new Error("ToneCtxProvider is missing");
  return ctx;
};

export { ToneCtx, ToneCtxProvider, useToneCtx };
