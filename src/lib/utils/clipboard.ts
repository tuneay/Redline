export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the local selection path when permission is blocked.
    }
  }

  const activeElement = document.activeElement;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto -9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (activeElement instanceof HTMLElement) {
    activeElement.focus({ preventScroll: true });
  }

  if (!copied) {
    throw new Error("Clipboard copy was unavailable.");
  }
}
