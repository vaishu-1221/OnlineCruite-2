import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or secret is missing!");
}

// ⏱ increase timeout to avoid 3s crash
const streamOptions = {
  timeout: 15000, // 15 seconds (safe for cloud/free tiers)
};

// Chat client (used for tokens + users)
export const chatClient = new StreamChat(apiKey, apiSecret, streamOptions);

// Node SDK client (server-side actions)
export const streamClient = new StreamClient(apiKey, apiSecret, streamOptions);

// Upsert a user into Stream
export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting user to Stream:", error);
    throw error;
  }
};

// Delete a user from Stream
export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting user from Stream:", error);
    throw error;
  }
};
