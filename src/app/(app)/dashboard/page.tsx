'use client'


import { Message } from '@/models/User'
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'sonner'; // Toast notifications
import { z } from 'zod';
import { MessageCard } from '@/components/MessageCard';
import { Copy, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { User } from 'next-auth';
import Messages from "@/messages.json"




function UserDashboard() {

    // State to store messages and loading states
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState(false);

    // Handler to delete a message by ID
    const handleDeleteMessages = (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId));
    };



    // Get user session (auth)
    const { data: session } = useSession();


    // Form setup using zod schema
    const form = useForm({
        resolver: zodResolver(AcceptMessageSchema),
    });

    // Destructure helper functions from form
    const { setValue, register, watch } = form;

    // Watch the acceptMessages field in the form
    const acceptMessages = watch('acceptMessages');




    // ✅ useCallback memoizes the function so it's not recreated on every render
    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true); // show loading on switch

        try {
            const response = await axios.get("/api/accept-messages");

            // if API call succeeds, update form field
            if (response.data.success) {
                setValue('acceptMessages', response.data.isAcceptingMessages);
            } else {
                toast.error("Failed to fetch data", {
                    description: response.data.message
                });
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error("Error", {
                description: axiosError.response?.data.message ?? "Failed to fetch Message settings"
            });
        } finally {
            setIsSwitchLoading(false); // done loading
        }
    }, [setValue]); // 👈 depends only on setValue, ensures stable function reference




    // ✅ Another memoized function to fetch user messages
    const fetchMessages = useCallback(async (refresh: boolean = false) => {
        setIsLoading(true);
        setIsSwitchLoading(false);

        try {
            const response = await axios.get<ApiResponse>("/api/get-messages");

            // Update messages from response
            setMessages(response.data.messages || []);

            if (refresh) {
                toast.success("Refreshed Messages", {
                    description: "Showing latest messages"
                });
            }

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.log("Error in dashboard", error);

            toast.error("Error", {
                description: axiosError.response?.data.message ?? 'Failed to fetch messages'
            });

        } finally {
            setIsLoading(false);
            setIsSwitchLoading(false);
        }
    }, [setMessages, setIsLoading]); // 👈 Memoized to avoid redefinition on each render





    // ✅ useEffect runs on mount or when dependencies change
    useEffect(() => {
        if (!session || !session.user) return; // ⛔ do nothing if not logged in

        // ✅ Fetch messages and message switch state on initial load
        fetchMessages();
        fetchAcceptMessage();

    }, [setValue, fetchAcceptMessage, fetchMessages, session]); // 👈 runs when any dependency changes



    
const handleSwitchChange=async()=>{
    try {
         const response = await axios.post<ApiResponse>('/api/accept-messages', {
            acceptMessages: !acceptMessages,
          });
          
        setValue('acceptMessages',!acceptMessages);

        toast.success("Success",{description:response.data.message});
    } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error("Error", {
                description: axiosError.response?.data.message ?? "Failed to fetch Message settings"
            });
        } 

}


if (!session || !session.user) {
    return <div></div>;
  }

// Extract username from session (typecast as User type)
const { username } = session?.user as User;

// Construct base URL of the current site (e.g., https://yourdomain.com)
const baseUrl = `${window.location.protocol}//${window.location.host}`;

// Full profile URL for the user
const profileUrl = `${baseUrl}/u/${username}`;

// ✅ Copy profile URL to clipboard and show a toast
const copyToClipboard = () => {
  navigator.clipboard.writeText(profileUrl);
  toast.success("URL Copied", {
    description: "Profile URL has been copied to clipboard.",
  });
};


  return (
    <div className="my-10 mx-4 md:mx-8 lg:mx-auto p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg w-full max-w-6xl space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold text-zinc-800 dark:text-white">📬 User Dashboard</h1>

      {/* Profile Link */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Your Unique Link</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="w-full rounded-md border border-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-700 dark:text-white"
          />
          <Button variant="secondary" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
        </div>
      </div>

      {/* Message Switch */}
      <div className="flex items-center space-x-3">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>

      <Separator />

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessages}
            />
          ))
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400 text-center col-span-full">
            No messages to display.
          </p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;