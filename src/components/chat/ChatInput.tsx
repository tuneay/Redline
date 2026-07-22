"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  type Variants,
} from "motion/react";

import { useMotionEnvironment } from "@/components/motion/motion-context";
import {
  duration,
  ease,
  reducedMotionTransition,
  spring,
} from "@/components/motion/motion-tokens";

const MAX_MESSAGE_LENGTH = 4_000;
const LENGTH_WARNING_THRESHOLD = 3_500;
const MAX_TEXTAREA_HEIGHT = 168;

type InputVisualState =
  | "empty"
  | "hover"
  | "focus"
  | "typing"
  | "valid"
  | "disabled"
  | "processing"
  | "error";

const DOCK_VARIANTS = {
  empty: {
    backgroundColor: "var(--surface-1)",
    borderColor: "var(--line-subtle)",
    boxShadow: "0 0 0 0 rgba(255, 59, 48, 0)",
    opacity: 1,
    scale: 1,
    y: 0,
  },
  hover: {
    backgroundColor: "var(--surface-2)",
    borderColor: "var(--line-strong)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.02)",
    opacity: 1,
    scale: 1,
    y: -1,
  },
  focus: {
    backgroundColor: "var(--surface-2)",
    borderColor: "rgba(255, 59, 48, 0.3)",
    boxShadow: "0 0 0 1px rgba(255, 59, 48, 0.06)",
    opacity: 1,
    scale: 1,
    y: -1,
  },
  typing: {
    backgroundColor: "var(--surface-2)",
    borderColor: "rgba(255, 59, 48, 0.26)",
    boxShadow: "0 0 0 1px rgba(255, 59, 48, 0.04)",
    opacity: 1,
    scale: 1,
    y: -1,
  },
  valid: {
    backgroundColor: "var(--surface-1)",
    borderColor: "var(--line-strong)",
    boxShadow: "0 0 0 0 rgba(255, 59, 48, 0)",
    opacity: 1,
    scale: 1,
    y: 0,
  },
  disabled: {
    backgroundColor: "var(--surface-1)",
    borderColor: "var(--line-subtle)",
    boxShadow: "0 0 0 0 rgba(255, 59, 48, 0)",
    opacity: 0.58,
    scale: 1,
    y: 0,
  },
  processing: {
    backgroundColor: "var(--surface-1)",
    borderColor: "rgba(122, 30, 26, 0.72)",
    boxShadow: "0 0 0 0 rgba(255, 59, 48, 0)",
    opacity: 0.82,
    scale: 0.996,
    y: 0,
  },
  error: {
    backgroundColor: "var(--surface-1)",
    borderColor: "rgba(122, 30, 26, 0.9)",
    boxShadow: "0 0 0 1px rgba(122, 30, 26, 0.08)",
    opacity: 0.82,
    scale: 1,
    y: 0,
  },
} satisfies Variants;

export type ChatInputStatus = "idle" | "processing" | "disabled" | "error";

interface ChatInputProps {
  focusSignal?: string;
  forceFocusSignal?: number;
  onInteract?: () => void;
  onSubmit: (message: string) => void;
  placeholder?: string;
  status: ChatInputStatus;
}

export function ChatInput({
  focusSignal,
  forceFocusSignal,
  onInteract,
  onSubmit,
  placeholder = "Answer the question directly.",
  status,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handledForceFocusRef = useRef<number | undefined>(undefined);
  const characterStatusId = useId();
  const { shouldReduceMotion } = useMotionEnvironment();
  const isProcessing = status === "processing";
  const isDisabled = status !== "idle";
  const trimmedValue = value.trim();
  const canSubmit = trimmedValue.length > 0 && !isDisabled;
  const shouldWarnAboutLength = value.length >= LENGTH_WARNING_THRESHOLD;

  useEffect(() => {
    const shouldForceFocus =
      forceFocusSignal !== undefined &&
      handledForceFocusRef.current !== forceFocusSignal;

    if (
      (focusSignal || shouldForceFocus) &&
      status === "idle" &&
      (shouldForceFocus || document.activeElement === document.body)
    ) {
      textareaRef.current?.focus({ preventScroll: true });
    }

    if (shouldForceFocus) {
      handledForceFocusRef.current = forceFocusSignal;
    }
  }, [focusSignal, forceFocusSignal, status]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [value]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onInteract?.();
    setIsClearing(true);
    onSubmit(trimmedValue);
  }

  function handleTextareaAnimationComplete() {
    if (isClearing && value.length > 0) {
      setValue("");
      setIsClearing(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      if (canSubmit) {
        event.currentTarget.form?.requestSubmit();
      }
    }
  }

  const visualState: InputVisualState = isProcessing
    ? "processing"
    : status === "error"
      ? "error"
      : status === "disabled"
        ? "disabled"
        : isFocused && value.length > 0
          ? "typing"
          : isFocused
            ? "focus"
            : value.length > 0
              ? "valid"
              : isHovered
                ? "hover"
                : "empty";
  const showSignalLine =
    visualState === "focus" ||
    visualState === "typing" ||
    visualState === "processing" ||
    visualState === "error";
  const controlLabel = isProcessing
    ? "Analyzing"
    : status === "error"
      ? "Paused"
      : status === "disabled"
        ? "Inactive"
        : "Send";

  return (
    <motion.form
      animate={visualState}
      aria-busy={isProcessing}
      className="input-dock relative isolate overflow-hidden rounded-[1.625rem] border p-2"
      data-state={visualState}
      initial={false}
      layout={!shouldReduceMotion}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onSubmit={handleSubmit}
      transition={
        shouldReduceMotion
          ? reducedMotionTransition
          : {
              backgroundColor: { duration: duration.instant },
              borderColor: { duration: duration.instant },
              default: { duration: duration.fast, ease: ease.out },
              layout: spring.layout,
            }
      }
      variants={DOCK_VARIANTS}
    >
      <motion.span
        animate={{
          opacity: showSignalLine ? 1 : 0,
          scaleX: showSignalLine ? (isFocused ? 1 : 0.72) : 0.16,
        }}
        aria-hidden="true"
        className="absolute bottom-0 left-8 h-px w-12 origin-left bg-signal-red"
        initial={false}
        transition={{ duration: duration.fast, ease: ease.out }}
      />

      <motion.div className="flex items-end gap-2 pl-3" layout="position">
        <label className="sr-only" htmlFor="redline-message">
          {placeholder}
        </label>
        <motion.textarea
          animate={{
            opacity: isProcessing || isClearing ? 0.32 : 1,
            x: isClearing && !shouldReduceMotion ? -2 : 0,
          }}
          aria-describedby={characterStatusId}
          aria-invalid={status === "error"}
          autoComplete="off"
          className="min-h-11 min-w-0 flex-1 bg-transparent py-[0.6875rem] pr-2 text-base leading-[1.45] text-text-primary caret-signal-red placeholder:text-text-secondary disabled:cursor-wait disabled:text-text-tertiary"
          disabled={isDisabled}
          id="redline-message"
          maxLength={MAX_MESSAGE_LENGTH}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onInteract?.();
          }}
          onKeyDown={handleKeyDown}
          onAnimationComplete={handleTextareaAnimationComplete}
          placeholder={placeholder}
          ref={textareaRef}
          rows={1}
          spellCheck="true"
          transition={{ duration: duration.fast, ease: ease.out }}
          value={value}
        />

        <motion.button
          aria-label={isProcessing ? "Redline is processing" : "Send message"}
          className="group/send mb-0.5 flex h-11 min-w-[5.25rem] shrink-0 items-center justify-center gap-2 rounded-[1.125rem] border border-line-subtle bg-transparent px-4 text-[0.75rem] font-medium tracking-[0.02em] text-text-tertiary transition-[color,background-color,border-color,opacity] duration-150 ease-out enabled:border-line-strong enabled:bg-text-primary enabled:text-background enabled:hover:border-white enabled:hover:bg-white disabled:cursor-default disabled:opacity-80"
          disabled={!canSubmit}
          onPointerEnter={() => setIsSendHovered(true)}
          onPointerLeave={() => setIsSendHovered(false)}
          type="submit"
          whileHover={
            canSubmit && !shouldReduceMotion
              ? { scale: 1.01, y: -1 }
              : undefined
          }
          whileTap={
            canSubmit && !shouldReduceMotion
              ? { scale: 0.99, y: 0 }
              : undefined
          }
        >
          <motion.span
            animate={{
              opacity: isProcessing || canSubmit ? 1 : 0.38,
              width: isProcessing ? 16 : canSubmit ? (isSendHovered ? 10 : 6) : 4,
            }}
            aria-hidden="true"
            className="h-px shrink-0 bg-signal-red"
            transition={{ duration: duration.fast, ease: ease.out }}
          />
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              exit={{ filter: "blur(2px)", opacity: 0, y: -2 }}
              initial={
                shouldReduceMotion
                  ? false
                  : { filter: "blur(2px)", opacity: 0, y: 2 }
              }
              key={controlLabel}
              transition={{ duration: duration.instant, ease: ease.out }}
            >
              {controlLabel}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.div>

      <motion.div
        className="flex min-h-5 items-center justify-between gap-4 px-3 pt-1 pb-0.5 text-[0.625rem] leading-4 tracking-[0.06em] text-text-secondary"
        id={characterStatusId}
        layout="position"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -1 }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 1 }}
            key={isProcessing ? "paused" : "keyboard-hint"}
            transition={{ duration: duration.instant, ease: ease.out }}
          >
            {isProcessing
              ? "Input paused during analysis"
              : status === "error"
                ? "Resolve the request before continuing"
                : status === "disabled"
                  ? "Input unavailable"
                  : (
                      <>
                        <span className="sm:hidden">Enter to send</span>
                        <span className="hidden sm:inline">
                          Enter to send {"\u00b7"} Shift + Enter for a new line
                        </span>
                      </>
                    )}
          </motion.span>
        </AnimatePresence>
        <span
          aria-live="polite"
          className={
            shouldWarnAboutLength
              ? "shrink-0 text-text-secondary tabular-nums"
              : "hidden"
          }
        >
          {value.length} / {MAX_MESSAGE_LENGTH}
        </span>
      </motion.div>
    </motion.form>
  );
}
