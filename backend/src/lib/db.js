import mongoose from "mongoose";
import {ENV} from "./env.js";

export const connectDB=async()=>{
    try{
        if(!ENV.MONGODB_URL){
            throw new Error("MONGODB_URL is not defined in environment variables");
        }
        const conn=await mongoose.connect(ENV.MONGODB_URL);
        console.log("Mongoose Connected successfully",conn.connection.host);
    }catch(err){
        console.log("Mongoose Connection Failed",err)
        process.exit(1);
    }
}