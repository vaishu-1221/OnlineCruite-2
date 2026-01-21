import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req,res){
    try{
        //use clerkId for stream not mongodb id
        const token=chatClient.createToken(req.user.clerkId);
        res.status(200).json({
            token,
            userId:req.user.clerkId,
            userName:req.user.name,
            userImage:req.user.image
        });
        
    }catch(error){
        console.error("Error generating stream token:",error);
        res.status(500).json({msg:'Failed to generate stream token'});
    }
}