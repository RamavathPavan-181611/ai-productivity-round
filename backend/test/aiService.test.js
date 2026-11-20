const test = require("node:test");
const assert = require("node:assert/strict");

const {
  TONE_INSTRUCTIONS,
  getFallbackResponse,
  createAIStream,
  createTokenEstimate,
} = require("../src/services/aiService");

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
