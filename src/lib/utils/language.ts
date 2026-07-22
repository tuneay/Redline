const TURKISH_CHARACTER_PATTERN = /[çğıöşüÇĞİÖŞÜ]/u;
const TURKISH_SINGLE_WORD_PATTERN =
  /^(?:selam|merhaba|günaydın|nasılsın|nasılsınız|teşekkürler|evet|hayır)$/iu;
const TURKISH_WORD_PATTERN =
  /\b(bir|bu|ve|için|kullanıcı|kullanıcılar|ürün|fikir|ama|çünkü|ile|olan|olarak|bence|istiyorum|yapmak|uygulama|proje|projem|fikrim|sorun|çözüm|insanlar|daha|neden|nasıl|hangi|kim|nerede|var|yok|değil)\b/giu;

interface LanguageMessage {
  content: string;
  role: "assistant" | "user";
}

export type TargetLanguage = "Turkish" | "auto";

function getUserText(messages: readonly LanguageMessage[]): string {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join(" ")
    .trim();
}

export function isLikelyTurkishText(text: string): boolean {
  const normalized = text.trim();

  return (
    TURKISH_CHARACTER_PATTERN.test(normalized) ||
    TURKISH_SINGLE_WORD_PATTERN.test(normalized) ||
    (normalized.match(TURKISH_WORD_PATTERN)?.length ?? 0) >= 2
  );
}

export function detectTargetLanguage(
  messages: readonly LanguageMessage[],
): TargetLanguage {
  return isLikelyTurkishText(getUserText(messages)) ? "Turkish" : "auto";
}

export function getLanguageHint(messages: readonly LanguageMessage[]): string {
  if (detectTargetLanguage(messages) === "Turkish") {
    return "Turkish (Türkçe). Every user-visible natural-language field must be in Turkish. Do not answer in English. Keep schema keys and contract enum values in English.";
  }

  return "Detect the dominant language from the latest user messages. Every user-visible natural-language field must use that same language. Never default to English merely because schema keys are English.";
}
