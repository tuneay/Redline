import type {
  APIConversationMessage,
  InterrogateRequest,
} from "./api";
import type { StoredSession } from "./storage";
import type { VerdictRequest } from "./verdict";

export interface SequenceValidationResult {
  success: boolean;
  message?: string;
}

function fail(message: string): SequenceValidationResult {
  return { success: false, message };
}

export function validateInterrogateConversation(
  request: InterrogateRequest,
): SequenceValidationResult {
  const messages = request.messages;
  let cursor = 0;

  if (
    messages[0]?.role === "assistant" &&
    messages[0].questionNumber === undefined
  ) {
    cursor = 1;
  }

  const idea = messages[cursor];

  if (
    !idea ||
    idea.role !== "user" ||
    idea.questionNumber !== undefined
  ) {
    return fail("Conversation must begin with one user idea.");
  }

  cursor += 1;

  for (let questionNumber = 1; questionNumber <= request.questionIndex; questionNumber += 1) {
    const question = messages[cursor] as APIConversationMessage | undefined;
    const answer = messages[cursor + 1] as APIConversationMessage | undefined;

    if (
      !question ||
      question.role !== "assistant" ||
      question.questionNumber !== questionNumber
    ) {
      return fail(`Assistant question ${questionNumber} is missing or out of order.`);
    }

    if (
      !answer ||
      answer.role !== "user" ||
      answer.questionNumber !== questionNumber
    ) {
      return fail(`User answer ${questionNumber} is missing or out of order.`);
    }

    cursor += 2;
  }

  if (cursor !== messages.length) {
    return fail("Conversation contains unexpected messages.");
  }

  if (messages.at(-1)?.role !== "user") {
    return fail("The latest message must be from the user.");
  }

  return { success: true };
}

export function validateVerdictConversation(
  request: VerdictRequest,
): SequenceValidationResult {
  const messages = request.messages;
  let cursor = 0;

  if (
    messages[0]?.role === "assistant" &&
    messages[0].questionNumber === undefined
  ) {
    cursor = 1;
  }

  const idea = messages[cursor];

  if (!idea || idea.role !== "user" || idea.questionNumber !== undefined) {
    return fail("Conversation must contain exactly one initial user idea.");
  }

  cursor += 1;

  for (let questionNumber = 1; questionNumber <= 5; questionNumber += 1) {
    const question = messages[cursor] as APIConversationMessage | undefined;
    const answer = messages[cursor + 1] as APIConversationMessage | undefined;

    if (
      !question ||
      question.role !== "assistant" ||
      question.questionNumber !== questionNumber
    ) {
      return fail(
        `Assistant question ${questionNumber} is missing or out of order.`,
      );
    }

    if (
      !answer ||
      answer.role !== "user" ||
      answer.questionNumber !== questionNumber
    ) {
      return fail(`User answer ${questionNumber} is missing or out of order.`);
    }

    cursor += 2;
  }

  if (cursor !== messages.length) {
    return fail("Verdict conversation contains unexpected messages.");
  }

  return { success: true };
}

export function validateStoredConversation(
  session: StoredSession,
): SequenceValidationResult {
  const [greeting, idea, ...turns] = session.messages;

  if (!greeting || greeting.kind !== "greeting") {
    return fail("Stored session is missing its greeting.");
  }

  if (!idea) {
    return session.phase === "awaiting_idea"
      ? { success: true }
      : fail("Stored session phase does not match an empty conversation.");
  }

  if (idea.kind !== "idea") {
    return fail("Stored session does not begin with an idea.");
  }

  let cursor = 0;

  for (let questionNumber = 1; questionNumber <= session.questionIndex; questionNumber += 1) {
    const question = turns[cursor];

    if (
      !question ||
      question.kind !== "question" ||
      question.questionNumber !== questionNumber
    ) {
      return fail("Stored questions are not sequential.");
    }

    cursor += 1;
    const answer = turns[cursor];

    if (!answer) {
      if (questionNumber !== session.questionIndex) {
        return fail("Stored conversation stops before its active question.");
      }

      break;
    }

    if (
      answer.kind !== "answer" ||
      answer.questionNumber !== questionNumber
    ) {
      return fail("Stored answers are not sequential.");
    }

    cursor += 1;
  }

  if (cursor !== turns.length) {
    return fail("Stored conversation contains unexpected messages.");
  }

  if (
    (session.phase === "generating_verdict" || session.phase === "verdict") &&
    (session.questionIndex !== 5 || session.messages.at(-1)?.kind !== "answer")
  ) {
    return fail("Verdict state requires five complete answers.");
  }

  return { success: true };
}
