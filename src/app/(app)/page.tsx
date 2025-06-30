'use client'

import React, { useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import messages from '@/messages.json';
import { ArrowRightCircle, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import {toast} from "sonner"

const HomePage = () => {

  const {data:session}=useSession();
  const [username , setUsername]=useState('');
  const router=useRouter();


  const handleSendMessage=async ()=>{
    
    try {
      console.log(username);
      const response=await axios.get("/api/checkUsername",
        {params:{username}
    });
       if(response.data.success){
        if(username.trim()){
        router.push(`/u/${username.trim()}`);
      }
    }
    
    } catch (error) {
      const axiosError=error as AxiosError<ApiResponse>
       if (axiosError.response?.status === 404) {
      toast.error("Failed to fetch User", {
        description: axiosError.response.data.message,
      });
    } else {
      toast.error("Error", {
        description: axiosError.response?.data.message || axiosError.message,
      });
    }
  }
};

  return (
    <>
      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-2  md:px-12 py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Dive into Anonymous Feedback
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300">
            FeedLinerX - Where your voice matters, your identity does not.
          </p>
        </section>

        {/* Carousel Section */}
        <Carousel
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full max-w-6xl mb-3"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 px-2">
                <Card className="bg-gray-600 backdrop-blur-lg border border-white/20 text-white shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">{message.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-start gap-3">
                    <Mail className="mt-1 text-blue-400" />
                    <div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>


    <div className="mt-4 flex flex-col items-center justify-center">
  <h2 className="text-2xl text-gray-300 font-extrabold tracking-tight text-center">
    Speak Freely, Stay Anonymous
  </h2>
  <h2 className="text-xl text-gray-300 font-bold tracking-tight text-center mt-2">
    Unmask the Truth, Stay Hidden
  </h2>
{session? (<div className="mt-6 w-full max-w-md px-4 sm:px-0">
    <div className="flex flex-col justify-center sm:flex-row gap-3">
      <input
        type="text"
        value={username}
        placeholder='Enter username(e.g.Indranuj)'
        onChange={(e) => setUsername(e.target.value)}
        className="flex-1 px-4 py-2 rounded-md ring-2 ring-slate-800 border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        onClick={handleSendMessage}
      >
        <ArrowRightCircle/>Go Send Messages
      </Button>
    </div>
  </div>) : (<div className="mt-6 w-full max-w-md px-4 sm:px-0">
    <div className="flex flex-col justify-center text-center  sm:flex-row gap-3">
      <input
        type="text"
        value={username}
        placeholder="Enter username(e.g.Indranuj)"
        onChange={(e) => setUsername(e.target.value)}
        className="flex-1 px-4 py-2 rounded-md  ring-2 ring-blue-500 border-gray-300 text-black focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-700"
      />
      <Link href="/sign-in">
       <Button
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
         <ArrowRightCircle/>Go Send Messages
        </Button>
     </Link>
      
    </div>
  </div>)}
  
</div>

        
      </main>
    </>
  );
}

export default HomePage;
