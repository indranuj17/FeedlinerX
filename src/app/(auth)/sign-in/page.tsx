
'use client'; // Ensures this component runs on the client side
import React from 'react'
// Import necessary dependencies

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner'; // Toast notifications


import { useRouter } from 'next/navigation';

import { signInSchema } from '@/schemas/signInSchema';
import { signIn } from 'next-auth/react';

export default function SignInForm() {
  const router = useRouter();

  // Initialize React Hook Form with Zod schema
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });


  
const onSubmit = async (data: z.infer<typeof signInSchema>) => {
  const result = await signIn('credentials', {
    redirect: false,
    callbackUrl:"/",
    identifier: data.identifier,
    password: data.password,
  });

  if (result?.error) {
    if (result.error === 'CredentialsSignin') {
      toast.error('Login Failed', {
        description: 'Incorrect Email or Password',
      });
    } else {
      toast.error('Error', {
        description: result.error,
      });
    }
  } else if (result?.ok && result.url) {
    toast.success('Logged In Successfully!', {
      description: 'Welcome Back to FeedLinerX',
    });

    // Small delay to let toast show (optional)
    setTimeout(() => {
      router.replace('/'); // or use router.replace('/')
    }, 800);
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome Back to FeedLinerX
          </h1>
          <p className="mb-4">Sign in to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='w-full' type="submit">Sign In</Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Not a member yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}