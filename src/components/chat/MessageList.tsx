"use client";

import { AnimatePresence, motion } from "motion/react";

import { useMotionEnvironment } from "@/components/motion/motion-context";
import { spring } from "@/components/motion/motion-tokens";
import type { ConversationMessage } from "@/lib/schemas/conversation";

import { AIMessage } from "./AIMessage";
import { UserMessage } from "./UserMessage";

interface MessageListProps {
  cancelledMessageId?: string;
  dimmed?: boolean;
  messages: ConversationMessage[];
  onMessageRevealed?: (messageId: string) => void;
}

export function MessageList({
  cancelledMessageId,
  dimmed = false,
  messages,
  onMessageRevealed,
}: MessageListProps) {
  const { shouldReduceMotion } = useMotionEnvironment();

  return (
    <motion.ol
      animate={{ opacity: dimmed ? 0.52 : 1 }}
      className="space-y-14 sm:space-y-16"
      layout={!shouldReduceMotion}
      role="list"
      transition={{ layout: spring.layout }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {messages.map((message, index) => (
          <motion.li
            className={
              message.role === "assistant" &&
              index > 0 &&
              messages[index - 1]?.role === "user"
                ? "pt-2 sm:pt-4"
                : undefined
            }
            key={message.id}
            layout={!shouldReduceMotion}
            transition={{ layout: spring.layout }}
          >
            {message.role === "assistant" ? (
              <AIMessage
                cancelled={message.id === cancelledMessageId}
                isGreeting={message.kind === "greeting"}
                messageId={message.id}
                observation={
                  message.kind === "question"
                    ? message.observation
                    : undefined
                }
                onRevealComplete={() => onMessageRevealed?.(message.id)}
                question={
                  message.kind === "question"
                    ? message.question
                    : message.content
                }
                questionNumber={
                  message.kind === "question"
                    ? message.questionNumber
                    : undefined
                }
                revealed={message.revealed}
                supportingText={
                  message.kind === "greeting"
                    ? message.supportingText
                    : undefined
                }
              />
            ) : (
              <UserMessage
                messageId={message.id}
                onRevealComplete={() => onMessageRevealed?.(message.id)}
                revealed={message.revealed}
              >
                {message.content}
              </UserMessage>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ol>
  );
}
