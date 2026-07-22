export interface RevealRegistry {
  hasRevealed: (messageId: string) => boolean;
  markRevealed: (messageId: string) => void;
}

export function createRevealRegistry(
  initialMessageIds: Iterable<string> = [],
): RevealRegistry {
  const revealedMessageIds = new Set(initialMessageIds);

  return {
    hasRevealed: (messageId) => revealedMessageIds.has(messageId),
    markRevealed: (messageId) => {
      revealedMessageIds.add(messageId);
    },
  };
}
