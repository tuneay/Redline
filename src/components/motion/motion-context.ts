"use client";

import { createContext, useContext } from "react";

import type { RevealRegistry } from "./reveal-registry";

export interface MotionEnvironment {
  isHydrated: boolean;
  registry: RevealRegistry;
  shouldReduceMotion: boolean;
}

export const MotionEnvironmentContext =
  createContext<MotionEnvironment | null>(null);

export function useMotionEnvironment(): MotionEnvironment {
  const environment = useContext(MotionEnvironmentContext);

  if (!environment) {
    throw new Error("useMotionEnvironment must be used inside MotionProvider.");
  }

  return environment;
}

export function useRevealRegistry(): RevealRegistry {
  return useMotionEnvironment().registry;
}
