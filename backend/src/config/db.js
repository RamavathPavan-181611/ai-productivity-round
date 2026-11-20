const mongoose = require("mongoose");

async function connectDatabase() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai-chat-assistant";

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };
