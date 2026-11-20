const mongoose = require("mongoose");

const metricsSchema = new mongoose.Schema(
  {
    latencyMs: {
      type: Number,
      min: 0,
      default: 0,
    },
    wordCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    tokenCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50000,
    },
    tone: {
      type: String,
      enum: ["Professional", "Casual", "Concise"],
      default: "Professional",
    },
    metrics: {
      type: metricsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  },
);

const threadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      default: "New conversation",
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

threadSchema.index({ title: "text", "messages.content": "text" });

module.exports = mongoose.model("Thread", threadSchema);
