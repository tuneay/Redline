import type { Transition } from "motion/react";

type CubicBezier = [number, number, number, number];

export const duration = {
  instant: 0.12,
  fast: 0.2,
  standard: 0.34,
  slow: 0.52,
  emphasis: 0.72,
} as const;

export const ease = {
  out: [0.16, 1, 0.3, 1] satisfies CubicBezier,
  standard: [0.22, 1, 0.36, 1] satisfies CubicBezier,
  inOut: [0.65, 0, 0.35, 1] satisfies CubicBezier,
} as const;

export const spring = {
  soft: {
    type: "spring",
    stiffness: 260,
    damping: 30,
    mass: 0.9,
  } satisfies Transition,
  layout: {
    type: "spring",
    stiffness: 300,
    damping: 34,
    mass: 0.8,
  } satisfies Transition,
} as const;

export const reducedMotionTransition = {
  duration: duration.instant,
  ease: ease.out,
} satisfies Transition;
