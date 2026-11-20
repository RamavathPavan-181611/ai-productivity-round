const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/server");
const Thread = require("../src/models/Thread");

test("thread model verifies creation and history shape", async () => {
  const thread = new Thread({
    title: "Integration verification",
    messages: [
      { role: "user", content: "Hello", tone: "Professional" },
      {
        role: "assistant",
        content: "Welcome",
        tone: "Professional",
        metrics: { latencyMs: 12, wordCount: 1, tokenCount: 1 },
      },
    ],
  });

  const validationError = thread.validateSync();
  assert.equal(validationError, undefined);
  assert.equal(thread.messages.length, 2);
  assert.equal(thread.messages[1].metrics.latencyMs, 12);
});

test("express app exposes health route", () => {
  const paths = app.router?.stack
    ?.filter((layer) => layer.route)
    .map((layer) => layer.route.path);

  assert.ok(Array.isArray(paths));
  assert.ok(paths.includes("/api/health"));
});

test("all thread tones are valid", () => {
  for (const tone of ["Professional", "Casual", "Concise"]) {
    const thread = new Thread({
      title: "Tone check",
      messages: [{ role: "user", content: "Test", tone }],
    });
    assert.equal(thread.validateSync(), undefined);
  }
});
