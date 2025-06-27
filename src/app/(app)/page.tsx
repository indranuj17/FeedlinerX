'use client'

import React from 'react'
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
import { Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const HomePage = () => {

  const {data:session}=useSession();

  return (
    <>
      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-2  md:px-12 py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Dive into Anonymous Feedback
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300">
            FeedLinerX - Where your voice matters, your identity doesn't.
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
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-lg hover:scale-[1.02] transition-all duration-300">
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


          <div className='mt-4 flex  flex-col justify-center'>
             <h2 className="text-3xl md:text-3xl font-extrabold tracking-tight">
          Speak Freely, Stay Anonymous
          </h2>
             <h2 className=" text-center text-2xl md:text-2xl font-bold tracking-tight">
         Unmask the Truth, Stay Hidden
          </h2>

          {/* {session? 
          (<Link  href='/u'>
          <Button></Button></Link>)
          :() 
          
          } */}

          </div>
        
      </main>
    </>
  );
}

export default HomePage;
