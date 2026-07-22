import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const sourceRoot = path.join(projectRoot, "src");
const originalResolveFilename = Module._resolveFilename;
const originalLoad = Module._load;

function loadTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;

  module._compile(output, filename);
}

Module._extensions[".ts"] = loadTypeScript;
Module._extensions[".tsx"] = loadTypeScript;

Module._resolveFilename = function resolveFilename(
  request,
  parent,
  isMain,
  options,
) {
  if (request.startsWith("@/")) {
    request = path.join(sourceRoot, request.slice(2));
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

Module._load = function loadModule(request, parent, isMain) {
  if (request === "server-only") {
    return {};
  }

  return originalLoad.call(this, request, parent, isMain);
};

const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { ChatShell } = require("../src/components/chat/ChatShell.tsx");
const { MotionProvider } = require("../src/components/motion/MotionProvider.tsx");
const { WordReveal } = require("../src/components/motion/WordReveal.tsx");
const {
  getWordRevealTiming,
  shouldShowWordRevealImmediately,
  tokenizeText,
} = require("../src/lib/utils/text-tokens.ts");
const {
  MAX_USER_MESSAGE_CHARS,
} = require("../src/lib/schemas/conversation.ts");
const {
  interrogateRequestSchema,
} = require("../src/lib/schemas/api.ts");
const {
  getDistanceFromBottom,
  isWithinBottomThreshold,
} = require("../src/lib/utils/scroll.ts");

function renderReveal(revealed = false) {
  return renderToStaticMarkup(
    React.createElement(
      MotionProvider,
      null,
      React.createElement(WordReveal, {
        messageId: "greeting",
        revealed,
        text: "What are you building?",
      }),
    ),
  );
}

test("server and first-client motion state is deterministic and hydration-safe", () => {
  const firstRender = renderReveal();
  const secondRender = renderReveal();

  assert.equal(firstRender, secondRender);
  assert.match(
    firstRender,
    /filter:blur\(8px\);opacity:0;transform:translateY\(4px\)/u,
  );
  assert.match(firstRender, /class="sr-only">What are you building\?<\/span>/u);

  const completedRender = renderReveal(true);
  assert.doesNotMatch(completedRender, /filter:blur\(8px\)/u);
  assert.match(completedRender, /What are you building\?/u);
});

test("the complete chat shell produces deterministic server markup", () => {
  const renderChatShell = () =>
    renderToStaticMarkup(
      React.createElement(
        MotionProvider,
        null,
        React.createElement(ChatShell),
      ),
    );

  const firstRender = renderChatShell();
  const secondRender = renderChatShell();

  assert.equal(firstRender, secondRender);
  assert.match(firstRender, /What are you building\?/u);
  assert.doesNotMatch(firstRender, /suppressHydrationWarning/u);
});

test("word reveal preserves whitespace, caps long pacing, and exits immediately when required", () => {
  const tokens = tokenizeText("One\n\ntwo  three");
  assert.equal(tokens.map((token) => token.value).join(""), "One\n\ntwo  three");
  assert.equal(tokens.filter((token) => token.kind === "word").length, 3);

  const longTiming = getWordRevealTiming(500, {
    maxStaggerDelay: 0.8,
    preferredStagger: 0.024,
    startDelay: 0.1,
  });
  assert.ok(longTiming.totalStaggerDelay <= 0.8);
  assert.equal(longTiming.startDelay, 0.1);

  assert.equal(
    shouldShowWordRevealImmediately({
      cancelled: false,
      reducedMotion: true,
      revealed: false,
      revealedBeforeMount: false,
    }),
    true,
  );
  assert.equal(
    shouldShowWordRevealImmediately({
      cancelled: false,
      reducedMotion: false,
      revealed: false,
      revealedBeforeMount: true,
    }),
    true,
  );
});

test("request boundaries accept the UI maximum and reject oversized input", () => {
  const base = {
    sessionId: "phase-7-security",
    questionIndex: 0,
  };
  const accepted = interrogateRequestSchema.safeParse({
    ...base,
    messages: [{ role: "user", content: "x".repeat(MAX_USER_MESSAGE_CHARS) }],
  });
  const rejected = interrogateRequestSchema.safeParse({
    ...base,
    messages: [
      { role: "user", content: "x".repeat(MAX_USER_MESSAGE_CHARS + 1) },
    ],
  });

  assert.equal(accepted.success, true);
  assert.equal(rejected.success, false);
});

test("auto-scroll follows only near the bottom and yields to manual reading", () => {
  const nearBottom = { clientHeight: 700, scrollHeight: 1_500, scrollTop: 720 };
  const readingEarlier = { clientHeight: 700, scrollHeight: 1_500, scrollTop: 300 };

  assert.equal(getDistanceFromBottom(nearBottom), 80);
  assert.equal(isWithinBottomThreshold(nearBottom, 96), true);
  assert.equal(isWithinBottomThreshold(readingEarlier, 96), false);
});

test("Phase 7 source keeps reduced motion, focus, touch targets, and secrets explicit", () => {
  const globalCss = fs.readFileSync(
    path.join(sourceRoot, "app", "globals.css"),
    "utf8",
  );
  const rootLayout = fs.readFileSync(
    path.join(sourceRoot, "app", "layout.tsx"),
    "utf8",
  );
  const wordReveal = fs.readFileSync(
    path.join(sourceRoot, "components", "motion", "WordReveal.tsx"),
    "utf8",
  );
  const chatInput = fs.readFileSync(
    path.join(sourceRoot, "components", "chat", "ChatInput.tsx"),
    "utf8",
  );
  const chatShell = fs.readFileSync(
    path.join(sourceRoot, "components", "chat", "ChatShell.tsx"),
    "utf8",
  );
  const conversation = fs.readFileSync(
    path.join(sourceRoot, "components", "chat", "Conversation.tsx"),
    "utf8",
  );
  const messageList = fs.readFileSync(
    path.join(sourceRoot, "components", "chat", "MessageList.tsx"),
    "utf8",
  );
  const sourceFiles = fs
    .readdirSync(sourceRoot, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(?:ts|tsx)$/u.test(entry.name))
    .map((entry) => fs.readFileSync(path.join(entry.parentPath, entry.name), "utf8"))
    .join("\n");

  assert.match(globalCss, /prefers-reduced-motion: reduce/u);
  assert.match(globalCss, /:focus-visible/u);
  assert.match(wordReveal, /className="sr-only"/u);
  assert.match(wordReveal, /initial=\{false\}/u);
  assert.match(chatInput, /h-11/u);
  assert.match(chatShell, /h-dvh/u);
  assert.match(chatShell, /safe-area-bottom/u);
  assert.match(globalCss, /--content-max-width: 64rem/u);
  assert.match(globalCss, /--conversation-max-width: 56rem/u);
  assert.match(conversation, /var\(--conversation-max-width\)/u);
  assert.match(messageList, /messages\[index - 1\]\?\.role === "user"/u);
  assert.match(rootLayout, /<body suppressHydrationWarning>/u);
  assert.doesNotMatch(sourceFiles, /NEXT_PUBLIC_GROQ/iu);
  assert.doesNotMatch(sourceFiles, /console\.(?:log|debug)\(/u);
});

test("the runtime dependency surface contains no unused styling helpers or deployment packages", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"),
  );

  assert.equal(packageJson.dependencies.clsx, undefined);
  assert.equal(packageJson.dependencies["tailwind-merge"], undefined);
  assert.equal(packageJson.dependencies.vercel, undefined);
  assert.equal(packageJson.dependencies["@vercel/analytics"], undefined);
});
