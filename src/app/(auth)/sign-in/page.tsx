
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceValue } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/router"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios from "axios"


const page = () => {

  const [username,setUsername]=useState(' ');
  const [usernameMessage,setUsernameMessage]=useState(' ');
  const [isCheckingUsername,setisCheckingUsername]=useState(false);
  const [submitting,isSubmitting]=useState(false);

  const debouncedUsername=useDebounceValue(username,300);

  const {toast}=useToast();
  const router =useRouter();
  const form=useForm<z.infer<typeof signUpSchema>>({
    resolver:zodResolver(signUpSchema),
    defaultValues:{
      username:'',
      email:'',
      password:''
    }
  });

  useEffect(()=>{
    const checkUsernameUnique=async ()=>{
      if(debouncedUsername){
        setisCheckingUsername(true);
        setUsernameMessage(" ");

        try {
          const response=await axios.get(`/api/check-username-unique?username=${debouncedUsername}`);
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? 'Error checking username'
          );
        }finally{
          setisCheckingUsername(false);
        }
      }
    }

    checkUsernameUnique();
  },[debouncedUsername]);

  

  return (
    <div>page</div>
  )
}

export default page