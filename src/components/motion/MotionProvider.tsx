"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig, useReducedMotion } from "motion/react";

import { MotionEnvironmentContext } from "./motion-context";
import { duration, ease } from "./motion-tokens";
import { createRevealRegistry } from "./reveal-registry";

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const [registry] = useState(createRevealRegistry);
  const [isHydrated, setIsHydrated] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = isHydrated && prefersReducedMotion === true;
  const environment = useMemo(
    () => ({ isHydrated, registry, shouldReduceMotion }),
    [isHydrated, registry, shouldReduceMotion],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsHydrated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <MotionConfig
      reducedMotion={isHydrated ? "user" : "never"}
      transition={{ duration: duration.standard, ease: ease.standard }}
    >
      <MotionEnvironmentContext.Provider value={environment}>
        {children}
      </MotionEnvironmentContext.Provider>
    </MotionConfig>
  );
}
