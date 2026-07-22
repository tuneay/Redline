"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useMotionEnvironment } from "@/components/motion/motion-context";
import { isWithinBottomThreshold } from "@/lib/utils/scroll";

interface UseAutoScrollOptions {
  bottomThreshold?: number;
  contentKey: string;
}

export function useAutoScroll({
  bottomThreshold = 96,
  contentKey,
}: UseAutoScrollOptions) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const isReturningToLatestRef = useRef(false);
  const [showReturnToLatest, setShowReturnToLatest] = useState(false);
  const { shouldReduceMotion } = useMotionEnvironment();

  const followLatest = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container || !isNearBottomRef.current) {
      return;
    }

    container.scrollTo({ top: container.scrollHeight, behavior: "auto" });
  }, []);

  const scrollToLatest = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    isReturningToLatestRef.current = true;
    isNearBottomRef.current = true;
    setShowReturnToLatest(false);
    container.scrollTo({
      top: container.scrollHeight,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [shouldReduceMotion]);

  const revealContent = useCallback(
    (element: HTMLElement) => {
      if (!isNearBottomRef.current) {
        return;
      }

      isNearBottomRef.current = false;
      element.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [shouldReduceMotion],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    function handleScroll() {
      const activeContainer = scrollContainerRef.current;

      if (!activeContainer) {
        return;
      }

      const isNearBottom = isWithinBottomThreshold(
        {
          clientHeight: activeContainer.clientHeight,
          scrollHeight: activeContainer.scrollHeight,
          scrollTop: activeContainer.scrollTop,
        },
        bottomThreshold,
      );

      if (isReturningToLatestRef.current) {
        if (isNearBottom) {
          isReturningToLatestRef.current = false;
          isNearBottomRef.current = true;
          setShowReturnToLatest(false);
        }

        return;
      }

      isNearBottomRef.current = isNearBottom;
      setShowReturnToLatest(!isNearBottom);
    }

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [bottomThreshold]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(followLatest);
    return () => cancelAnimationFrame(frame);
  }, [contentKey, followLatest]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (!isNearBottomRef.current) {
        return;
      }

      requestAnimationFrame(followLatest);
    });

    observer.observe(container);

    if (container.firstElementChild) {
      observer.observe(container.firstElementChild);
    }

    return () => observer.disconnect();
  }, [followLatest]);

  return {
    scrollContainerRef,
    revealContent,
    scrollToLatest,
    showReturnToLatest,
  };
}
