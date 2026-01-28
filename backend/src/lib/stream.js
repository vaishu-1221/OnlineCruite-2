// import {StreamChat} from 'stream-chat';
// import { ENV } from './env.js';
// import {StreamClient} from '@stream-io/node-sdk';

// const apiKey=ENV.STREAM_API_KEY;
// const apiSecret=ENV.STREAM_API_SECRET;

// if(!apiKey || !apiSecret){
//     console.log('stream api key or secret is missing')
// }

// export const chatClient=StreamChat.getInstance(apiKey,apiSecret);

// export const streamClient=new StreamClient(apiKey,apiSecret);

// export const upsertStreamUser=async(userData)=>{
//             try{
//                 await chatClient.upsertUsers([userData]);
//                 return userData;
//             }catch(error){
//                 console.error("Error upserting user to Stream:",error);
//             }
// }

// export const deleteStreamUser=async(userId)=>{
//             try{
//                 await chatClient.deleteUser(userId);
//                 console.log("Stream user deleted successfully",userId);
//             }catch(error){
//                 console.error("Error deleting user from Stream:",error);
//             }
// }
import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or secret is missing!");
}

// Backend chat client with API secret (required for createToken)
export const chatClient = new StreamChat(apiKey, apiSecret);

// Stream Node SDK client for advanced server-side actions
export const streamClient = new StreamClient(apiKey, apiSecret);

// Upsert a user into Stream
export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting user to Stream:", error);
  }
};

// Delete a user from Stream
export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting user from Stream:", error);
  }
};
