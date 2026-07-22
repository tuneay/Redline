export interface ScrollMetrics {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
}

export function getDistanceFromBottom({
  clientHeight,
  scrollHeight,
  scrollTop,
}: ScrollMetrics): number {
  return Math.max(scrollHeight - scrollTop - clientHeight, 0);
}

export function isWithinBottomThreshold(
  metrics: ScrollMetrics,
  threshold: number,
): boolean {
  return getDistanceFromBottom(metrics) <= threshold;
}
