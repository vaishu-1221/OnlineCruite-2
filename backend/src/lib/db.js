import mongoose from "mongoose";
import {ENV} from "./env.js";

export const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(ENV.MONGODB_URL);
        console.log("Mongoose Connected successfully",conn.connection.host);
    }catch(err){
        console.log("Mongoose Connection Failed",err)
        process.exit(1);
    }
}