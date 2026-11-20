const test = require("node:test");
const assert = require("node:assert/strict");

const {
  TONE_INSTRUCTIONS,
  getFallbackResponse,
  createAIStream,
  createTokenEstimate,
  calculateResponseMetrics,
} = require("../src/services/aiService");
const {
  createSmartTitle,
  buildMarkdownTranscript,
} = require("../src/controllers/chatController");

test("maps every supported tone to a system instruction", () => {
  assert.equal(Object.keys(TONE_INSTRUCTIONS).length, 3);
  assert.match(TONE_INSTRUCTIONS.Professional, /professional/i);
  assert.match(TONE_INSTRUCTIONS.Casual, /casual/i);
  assert.match(TONE_INSTRUCTIONS.Concise, /brief/i);
});

test("returns a useful fallback response without provider keys", async () => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  const stream = await createAIStream({
    prompt: "Explain caching",
    tone: "Concise",
  });
  let text = "";
  for await (const chunk of stream) text += chunk;

  assert.match(text, /demo mode/i);
  assert.match(text, /Explain caching/);
});

test("estimates tokens and preserves zero for empty text", () => {
  assert.equal(createTokenEstimate(""), 0);
  assert.equal(createTokenEstimate("hello world"), 3);
});

test("generates a compact smart title from the first prompt", () => {
  assert.equal(
    createSmartTitle("Explain MongoDB indexing for a beginner"),
    "Explain MongoDB indexing for a beginner",
  );
  assert.equal(createSmartTitle("!!!"), "New conversation");
});

test("builds a server-side Markdown transcript with response metrics", () => {
  const markdown = buildMarkdownTranscript({
    title: "MongoDB caching",
    messages: [
      { role: "user", content: "Explain caching" },
      {
        role: "assistant",
        content: "Caching stores frequently used data.",
        metrics: { latencyMs: 42, wordCount: 5, tokenCount: 8 },
      },
    ],
  });

  assert.match(markdown, /^# MongoDB caching/m);
  assert.match(markdown, /### User/);
  assert.match(markdown, /Latency: 42 ms \| Words: 5 \| Estimated tokens: 8/);
});

test("calculates response metrics on the server", () => {
  const metrics = calculateResponseMetrics("MongoDB caches frequent reads.", Date.now() - 25);
  assert.ok(metrics.latencyMs >= 25);
  assert.equal(metrics.wordCount, 4);
  assert.ok(metrics.tokenCount > 0);
});
