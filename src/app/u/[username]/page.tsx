'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { useCompletion } from 'ai/react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {toast,Toaster} from "sonner";
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: '/api/suggest-messages',
    initialCompletion: initialMessageString,
  });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const [isLoading, setIsLoading] = useState(false);




  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast.success("Success",{
        description: response.data.message,
       
      });
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Error",{
 
        description:
          axiosError.response?.data.message ?? 'Failed to sent message',
       
      });
    } finally {
      setIsLoading(false);
    }
  };




  const fetchSuggestedMessages = async () => {
    try {
      complete('');
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Handle error appropriately
    }
  };

 return (
  <div className="container mx-auto my-8 p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-4xl">
    <h1 className="text-4xl font-bold mb-6 text-center text-gray-900 dark:text-white">
      Send an Anonymous Message
    </h1>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">
                Send to <span className="text-blue-600">@{username}</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your anonymous message..."
                  className="resize-none min-h-[120px] text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isLoading || !messageContent}
            className="w-full max-w-xs text-white bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send It'
            )}
          </Button>
        </div>
      </form>
    </Form>

    <Separator className="my-8" />

    {/* Suggested Messages */}
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Need inspiration?
        </h3>
        <Button
          onClick={fetchSuggestedMessages}
          disabled={isSuggestLoading}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
        >
          {isSuggestLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Suggest Messages'
          )}
        </Button>
      </div>

      <Card className="bg-gray-50 dark:bg-zinc-800">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Tap to insert a suggested message
          </h3>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {error ? (
            <p className="text-red-500">{error.message}</p>
          ) : (
            parseStringMessages(completion).map((message, index) => (
              <button
                key={index}
                onClick={() => handleMessageClick(message)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-blue-600 hover:text-white transition dark:bg-zinc-700 dark:text-white"
              >
                {message}
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>

    <Separator className="my-6" />

    <div className="text-center">
      <p className="mb-2 text-gray-600 dark:text-gray-300">
        Want your own message board?
      </p>
      <Link href="/sign-up">
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Create Your Account
        </Button>
      </Link>
    </div>
  </div>
);
}