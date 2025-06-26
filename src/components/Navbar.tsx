'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';
import { Command } from 'lucide-react';


function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;

  return (
    <nav className="w-full bg-zinc-900 shadow-xl shadow-slate-200 overflow-hidden">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        {/* Logo/Brand */}
        <div className='flex flex-row justify-between gap-5'>
        <Command size={36}  color='white'/>
        <Link href="/" className="text-white text-2xl font-semibold tracking-wide hover:opacity-90 transition">
          FeedLinerX
        </Link>
        </div>
        

        {/* Right Section */}
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-sm text-zinc-300 hidden sm:inline">
                Welcome, <strong>{user.username || user.email}</strong>
              </span>
              <Button
                onClick={() => signOut()}
                variant="outline"
                className="bg-white rounded-lg text-black hover:bg-zinc-200 transition"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="bg-white rounded-lg text-black hover:bg-zinc-200 transition"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
