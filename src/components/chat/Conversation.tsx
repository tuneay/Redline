import type { ConversationMessage } from "@/lib/schemas/conversation";
import type { Verdict } from "@/lib/schemas/verdict";

import { VerdictView } from "../verdict/VerdictView";
import { MessageList } from "./MessageList";

interface ConversationProps {
  cancelledMessageId?: string;
  dimmed?: boolean;
  messages: ConversationMessage[];
  onMessageRevealed?: (messageId: string) => void;
  onVerdictEnter?: (element: HTMLElement) => void;
  verdict?: Verdict | null;
  verdictRevealId?: string;
  verdictRevealed?: boolean;
}

export function Conversation({
  cancelledMessageId,
  dimmed = false,
  messages,
  onMessageRevealed,
  onVerdictEnter,
  verdict,
  verdictRevealId = "verdict",
  verdictRevealed = false,
}: ConversationProps) {
  return (
    <section
      aria-label="Conversation"
      className="mx-auto w-full max-w-[var(--conversation-max-width)] px-[var(--page-padding-mobile)] pt-[clamp(3rem,8vh,5.5rem)] pb-8 sm:px-[var(--page-padding-desktop)] sm:pb-10"
    >
      <MessageList
        cancelledMessageId={cancelledMessageId}
        dimmed={dimmed}
        messages={messages}
        onMessageRevealed={onMessageRevealed}
      />
      {verdict ? (
        <VerdictView
          onEnter={onVerdictEnter}
          onRevealComplete={() => onMessageRevealed?.(verdictRevealId)}
          revealId={verdictRevealId}
          revealed={verdictRevealed}
          verdict={verdict}
        />
      ) : null}
    </section>
  );
}
