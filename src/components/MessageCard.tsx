'use client'

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { X } from 'lucide-react';
import { Message } from '@/models/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import {toast,Toaster} from "sonner";
import { ApiResponse } from '@/types/ApiResponse';

// Define the type for props expected by the MessageCard component
type MessageCardProps = {
  message: Message; // The actual message object to display (includes _id, content, etc.)
  onMessageDelete: (messageId: string) => void; // Callback to notify parent component after deletion
};

// Functional React component to render each individual message card
export function MessageCard({ message, onMessageDelete }: MessageCardProps) {



  
  // Function to handle delete confirmation logic
  const handleDeleteConfirm = async () => {
    try {
      // Make an API call to delete the message by its ID
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}` // endpoint includes the message ID
      );

      // If successful, show a toast notification to the user
      toast.success("Message Deleted", {
        description: response.data.message,
      });

      // Inform the parent component to remove this message from UI state
      onMessageDelete(message._id.toString());

    } catch (error) {
      // If the request fails, cast error to AxiosError for type safety
      const axiosError = error as AxiosError<ApiResponse>;

      // Show an error toast with the message from the server, if available
      toast.error('Error', {
        description: axiosError.response?.data.message ?? 'Failed to delete message',
      });
    } 
  };


  return (
    <Card className="card-bordered ">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{message.content}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive'>
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this message.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="text-sm">
          {dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
        </div>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}