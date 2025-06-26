'use client'

import { Message } from '@/models/User'
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'sonner'; // Toast notifications
import { z } from 'zod';




const page = () => {
     
    const [messages,setMessages]=useState<Message[]>([]);
    const [isLoading,setIsLoading]=useState(false);
    const [isSwitchLoading,setIsSwitchLoading]=useState(false);


    const handleDeleteMessages=(messageId:string)=>{

        setMessages(
            messages.filter((message)=>message._id!==messageId)
          );

    }

    const {data: session}=useSession();

    const form=useForm({
        resolver:zodResolver(AcceptMessageSchema);
    })

    //destructering usesull helpers from form already
    const {setValue,register,watch}=useForm();

    const acceptMessages=watch('acceptMessages');


    const fetchAcceptMessage=useCallback(async()=>{
         setIsSwitchLoading(true);
        try {
            const response=await axios.get<ApiResponse>("/api/accept-messages");
            if(response.data.success){
            setValue('acceptMessages',response.data.isAcceptingMessage);
            }
            else{
                toast.error("Failed to fetch data",{description:response.data.message});
            }
        } catch (error) {
            const axiosError=error as AxiosError<ApiResponse>;
            toast.error("Error",{description:axiosError.response?.data.message ?? "Failed to fetch Message settings"});
        }finally{
            setIsSwitchLoading(false);
        }
    },[setValue]);



    


  return (
    <div>page</div>
  )
}

export default page