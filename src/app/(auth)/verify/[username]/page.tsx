'use client' // ✅
//  Ensures this component runs only on the client side

//  Next.js navigation hooks
import { useParams, useRouter } from 'next/navigation';
//  Zod schema and React Hook Form integration
import * as z from "zod";
import React from 'react';
import { useForm } from 'react-hook-form';
import { verifySchema } from '@/schemas/verifySchema';
import { zodResolver } from '@hookform/resolvers/zod';
//  Axios for HTTP requests and toast for notifications
import axios, { AxiosError } from 'axios';
import { toast } from "sonner";
//  UI components
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApiResponse } from '@/types/ApiResponse';


export default function VerifyAccount() {
  const router = useRouter(); // Used for programmatic navigation
  const params = useParams<{ username: string }>(); // Extracts `username` from URL, e.g., /verify/[username]

  // ✅ Set up the form with schema validation using Zod
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema), // Zod validation
    defaultValues:{
      code:'',
    }
  });


  // ✅ Submit handler for verification
  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      // Send POST request to the backend with the username and verification code
     
      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username, // from URL
        code: data.code, // from input
      });

      if (response.data.success) {
      toast.success("Success", { description: response.data.message });
      router.replace("/sign-in");
      } else {
       toast.error("Verification Failed", { description: response.data.message });
       }
    } catch (error) {
      // ✅ On error: show descriptive error toast
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error('Verification Failed', {
        description:
          axiosError.response?.data.message ?? 'An error occurred. Please try again.',
      });
    }
  };

  // ✅ UI layout
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>

        {/* ✅ Form rendering using RHF + Zod + ShadCN UI */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Verify</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
