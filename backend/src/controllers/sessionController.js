import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req,res){
    try{
        const {problem,difficulty}=req.body;
        const userId=req.user._id;
        const clerkId=req.user.clerkId;


        //create session logic here
        if(!problem || !difficulty){
            return res.status(400).json({msg:'Problem and difficulty are required'});
        }

        const callId=`session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        //create session in DB
        const session=await Session.create({
            problem,
            difficulty,
            host:userId,
            callId
        });

        //create a stream vc
        await streamClient.video.call("default",callId).getOrCreate({
            data:{
                created_by_id:clerkId,
                custom:{problem,difficulty,sessionId: session._id.toString()},
            },
        });

        //chat messaging
        const channel=chatClient.channel("messaging",callId,{
            name:`${problem} Session`,
            created_by_id:clerkId,
            members:[clerkId]
        })

        await channel.create();


        res.status(201).json({session})
    }catch(error){
        console.log("Error in createSession controller:",error.message);
        res.status(500).json({msg:'Server Error in creating session'});

    }
}
export async function getActiveSessions(_,res){
    try{
        const sessions=await Session.find({status:'active'})
        .populate('host','name profileImage email clerkId')
        .sort({createAt:-1})
        .limit(20);

        res.status(200).json({sessions});
    }catch(error){
        console.log("Error in getActiveSessions controller:",error.message);
        res.status(500).json({msg:'Server Error in fetching active sessions'});
    }
}
export async function getMyRecentSessions(req,res){
    try{
        //where user is either host or participant
        const userId=req.user._id;

        const sessions=await Session.find({
            status:'completed',
            $or:[
                {host:userId},
                {participants:userId}
            ]
        }).sort({createdAt:-1})
        .limit(20)
        
        res.status(200).json({sessions});

    }catch(error){
        console.log("Error in getMyRecentSessions controller:",error.message);
        res.status(500).json({msg:'Server Error in fetching recent sessions'});
    }
}
export async function getSessionById(req,res){
    try{
        const {id}=req.params

        const session=await Session.findById(id)
        .populate('host','name profileImage email clerkId')
        .populate('participants','name profileImage email clerkId');
        
        if(!session){
            return res.status(404).json({msg:'Session not found'});
        }
        res.status(200).json({session});
    }catch(error){
        console.log("Error in getSessionById controller:",error.message);
        res.status(500).json({msg:'Server Error in fetching session by ID'});
    }
}

export async function joinSession(req,res){
    try{
        const {id}=req.params;
        const userId=req.user._id;
        const clerkId=req.user.clerkId;

        const session=await Session.findById(id);

        if(!session){
            return res.status(404).json({msg:'Session not found'});
        }

        if(session.status !=='active'){
            return res.status(400).json({msg:'Cannot join a completed session'});
        }

        if(session.host.toString()===userId.toString()){
            return res.status(400).json({msg:'Host cannot join as participant'});
        }

        if(session.participants){
            return res.status(409).json({msg:'Session already has a participant'});
        }

        session.participants=userId;
        await session.save();

        //add user to stream vc
        const channel=chatClient.channel("messaging",session.callId);
        await channel.addMembers([clerkId]);

        res.status(200).json({msg:'Joined session successfully',session});
    }catch(error){
            console.log("Error in joinSession controller:",error.message);
            res.status(500).json({msg:'Server Error in joining session'});
    }
}

export async function endSession(req,res){
    try {
        const {id}=req.params;
        const userId=req.user._id;

        const session=await Session.findById(id);

        if(!session){
            return res.status(404).json({msg:'Session not found'});
        }

        if(session.host.toString()!==userId.toString()){
            return res.status(403).json({msg:'Only host can end the session'});
        }
        
        if(session.status==='completed'){
            return res.status(400).json({msg:'Session is already completed'});
        }

        session.status='completed';
        await session.save();

        const call=streamClient.video.call("default",session.callId);
        await call.delete({hard:true});

        const channel=chatClient.channel("messaging",session.callId);
        await channel.delete();

        res.status(200).json({msg:'Session ended successfully',session});
    } catch (error) {
        console.log("Error in endSession controller:",error.message);
        res.status(500).json({msg:'Server Error in ending session'});
    }
}