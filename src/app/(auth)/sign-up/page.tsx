'use client'; // Ensures this component runs on the client side

// Import necessary dependencies
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import { toast, Toaster } from 'sonner'; // Toast notifications
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schemas/signUpSchema';

export default function SignUpForm() {
  // Local states
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // Initialize React Hook Form with Zod schema
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  // Debounced effect to check username availability
  useEffect(() => {
    if (!username) return;

    // Delay the API request for 300ms (debounce)
    const handler = setTimeout(async () => {
      setIsCheckingUsername(true);
      setUsernameMessage(''); // Clear previous message

      try {
        // Call API to check if username is available
        const response = await axios.get<ApiResponse>(
          `/api/check-username-unique?username=${username}`
        );
        setUsernameMessage(response.data.message); // Display server message
      } catch (error) {
        console.log(error);
        const axiosError = error as AxiosError<ApiResponse>;
        // Show fallback error message if request fails
        setUsernameMessage(
          axiosError.response?.data.message ?? 'error checking username'
        );
      } finally {
        setIsCheckingUsername(false); // Reset loading state
      }
    }, 300);

    return () => clearTimeout(handler); // Cleanup for debounce
  }, [username]);




  // Submit handler for sign-up form
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data);
      
      if(response.data.success){
      // Show success toast
      toast.success('Success', { description: response.data.message });
      // Redirect to verification page
      router.replace(`/verify/${username}`);
      }
      else{
      toast.error("Registration failed",{description:response.data.message});
      }
      
    } catch (error) {
      console.error('Error during sign-up:', error);
      const axiosError = error as AxiosError<ApiResponse>;

      // Show error toast with message from server
      const errorMessage = axiosError.response?.data.message;
      toast.error('Signup failed', { description: errorMessage });
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };




  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e); // Update react-hook-form value
                      setUsername(e.target.value); // Update local state
                    }}
                  />
                  {/* Loader shown during availability check */}
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {/* Show message after checking */}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === 'Username is unique'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} />
                  <p className="text-muted text-gray-400 text-sm">
                    We will send you a verification code
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
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

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>

        {/* Sign-in link */}
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link
              href="/sign-in"
              className="text-blue-600 hover:text-blue-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
