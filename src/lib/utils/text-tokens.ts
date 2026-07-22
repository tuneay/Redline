export type TextToken =
  | {
      kind: "word";
      value: string;
      wordIndex: number;
    }
  | {
      kind: "whitespace";
      value: string;
    };

export interface WordRevealTimingOptions {
  maxStaggerDelay: number;
  preferredStagger: number;
  startDelay?: number;
}

export interface WordRevealTiming {
  stagger: number;
  startDelay: number;
  totalStaggerDelay: number;
}

export interface WordRevealVisibility {
  cancelled: boolean;
  reducedMotion: boolean;
  revealed: boolean;
  revealedBeforeMount: boolean;
}

export function tokenizeText(text: string): TextToken[] {
  let wordIndex = 0;

  return text
    .split(/(\s+)/u)
    .filter((token) => token.length > 0)
    .map((token) => {
      if (/^\s+$/u.test(token)) {
        return {
          kind: "whitespace" as const,
          value: token,
        };
      }

      const wordToken = {
        kind: "word" as const,
        value: token,
        wordIndex,
      };

      wordIndex += 1;
      return wordToken;
    });
}

export function getWordRevealTiming(
  wordCount: number,
  {
    maxStaggerDelay,
    preferredStagger,
    startDelay = 0,
  }: WordRevealTimingOptions,
): WordRevealTiming {
  const staggerSlots = Math.max(wordCount - 1, 0);
  const stagger =
    staggerSlots === 0
      ? 0
      : Math.min(preferredStagger, maxStaggerDelay / staggerSlots);

  return {
    stagger,
    startDelay,
    totalStaggerDelay: stagger * staggerSlots,
  };
}

export function shouldShowWordRevealImmediately({
  cancelled,
  reducedMotion,
  revealed,
  revealedBeforeMount,
}: WordRevealVisibility): boolean {
  return cancelled || reducedMotion || revealed || revealedBeforeMount;
}
