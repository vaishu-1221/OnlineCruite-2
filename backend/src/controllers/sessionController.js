import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

/**
 * Create a new session, initialize its video call and messaging channel, and respond with the created session.
 *
 * Creates a Session record using `req.body.problem` and `req.body.difficulty`, provisions a video call and a messaging channel tied to a generated callId, and sends the created session in the response.
 *
 * @param {import('express').Request} req - Express request. Expects `req.body.problem` (string) and `req.body.difficulty` (string). Uses `req.user._id` as the host ID and `req.user.clerkId` for stream/chat provisioning.
 * @param {import('express').Response} res - Express response used to send HTTP status and JSON:
 *   - 201 with the created session on success,
 *   - 400 if `problem` or `difficulty` is missing,
 *   - 500 on server error.
 */
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
/**
 * Retrieve up to 20 active sessions and send them in the response.
 *
 * Responds with HTTP 200 and a JSON body { sessions } containing sessions with
 * host populated (name, profileImage, email, clerkId), sorted by createdAt
 * descending and limited to 20 results. On failure, responds with HTTP 500 and
 * an error message.
 */
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
/**
 * Fetches up to 20 most recent completed sessions where the authenticated user was the host or a participant and sends them in the response.
 * @param {import('express').Request} req - Express request; expects authenticated user object on `req.user` with `_id`.
 * @param {import('express').Response} res - Express response; on success sends JSON `{ sessions }`.
 */
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
/**
 * Fetches a session by ID, including host and participant details, and sends it in the HTTP response.
 *
 * Looks up the Session document by the `id` route parameter and populates the host and participants
 * fields (`name`, `profileImage`, `email`, `clerkId`). Sends a 200 response with the session when found,
 * a 404 response when no session exists for the given ID, and a 500 response on server error.
 */
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

/**
 * Add the requesting user as the participant of a session and add the session's clerk to the chat channel.
 *
 * Finds the session by id from `req.params.id`, sets `req.user._id` as the session participant, saves the session,
 * and adds `req.user.clerkId` to the messaging channel identified by the session's `callId`.
 * Sends HTTP responses:
 * - 200 with `{ msg: 'Joined session successfully', session }` on success
 * - 404 with `{ msg: 'Session not found' }` if the session does not exist
 * - 400 with `{ msg: 'Session already has a participant' }` if a participant is already present
 * - 500 with `{ msg: 'Server Error in joining session' }` on server error
 *
 * @param {import('express').Request} req - Express request; expects `params.id` and `user` with `_id` and `clerkId`.
 * @param {import('express').Response} res - Express response used to send JSON status responses.
 */
export async function joinSession(req,res){
    try{
        const {id}=req.params;
        const userId=req.user._id;
        const clerkId=req.user.clerkId;

        const session=await Session.findById(id);

        if(!session){
            return res.status(404).json({msg:'Session not found'});
        }

        // if(session.status !=='active'){
        //     return res.status(400).json({msg:'Cannot join a completed session'});
        // }

        if(session.participants){
            return res.status(400).json({msg:'Session already has a participant'});
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

/**
 * Mark a session as completed and remove its associated video call and chat channel.
 *
 * Finds the session by ID, verifies the requester is the host, sets the session's status to "completed",
 * deletes the corresponding video call and messaging channel, and sends an HTTP response.
 *
 * Possible HTTP responses:
 * - 200: Session ended successfully (returns the updated session).
 * - 404: Session not found.
 * - 403: Requesting user is not the session host.
 * - 400: Session is already completed.
 */
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