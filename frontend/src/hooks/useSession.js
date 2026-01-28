import {useMutation,useQuery} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sessionApi } from "../api/sessions"

export const useCreateSession=()=>{
    const result=useMutation({
        mutationKey:["createSession"],
        mutationFn:sessionApi.createSession,
        onSuccess:()=>toast.success("session created successfully!"),
        onError:(error)=>toast.error(error.response?.data?.message || "Failed to create room"),
    })
    return result;
}

export const useActiveSessions=()=>{
    const result =useQuery({
        queryKey:["activeSessions"],
        queryFn:sessionApi.getActiveSessions
    })
    return result;
}

export const useMyRecentSessions=()=>{
    const result =useQuery({
        queryKey:["myRecentSessions"],
        queryFn:sessionApi.getMyRecentSessions
    })
    return result;
}

export const useSessionById=(id)=>{
    const result =useQuery({
        queryKey:["session",id],
        queryFn:()=>sessionApi.getSessionById(id),
        enabled:!!id,
        refetchInterval:5000,
    })
    return result;
}

export const useJoinSession=(id)=>{
    const result=useMutation({
        mutationKey:["joinSession"],
        mutationFn:(id)=>sessionApi.joinSession(id),
        onSuccess:()=>toast.success("joined session successfully"),
        onError:(error)=>toast.error(error.response?.data?.message || "Failed to create room"),
    })
    return result;
}

export const useEndSession=(id)=>{
    const result=useMutation({
        mutationKey:["endSession"],
        mutationFn:(id)=>sessionApi.endSession(id),
        onSuccess:()=>toast.success("Ended session successfully"),
        onError:(error)=>toast.error(error.response?.data?.message || "Failed to create room"),
    })
    return result;
}