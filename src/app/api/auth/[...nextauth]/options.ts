import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';  //could also be github Provider//Facebook Provider......
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';

// Main NextAuth configuration object
export const authOptions: NextAuthOptions = {
  providers: [
    // Use credentials-based login (email/username + password)
    CredentialsProvider({
      id: 'credentials',            // Custom ID for the provider
      name: 'Credentials',         // Label shown on the sign-in page
      credentials: {
        email: { label: 'Email', type: 'text' },        // Form input label/type
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any): Promise<any> {
        // Connect to the database
        await dbConnect();
        try {
          // Find user by email OR username
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          // If user not found, throw an error
          if (!user) {
            throw new Error('No user found with this email');
          }

          // If user is not verified, prevent login
          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }

          // Compare hashed password
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          // If password is correct, return user object
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err: any) {
          throw new Error(err); // Return any DB or logic error
        }
      },
    }),
  ],


  //This part of your NextAuth configuration (callbacks block) is crucial for customizing the session and JWT (JSON Web Token). It ensures that additional user properties (like _id, isVerified, isAcceptingMessages, username) are persisted and available on both client and server sides during authentication.
  callbacks: {


    // These custom user fields will be embedded inside the JWT payload and can be used throughout your app (e.g., checking if a user is verified).
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    //Sync values from the token (JWT) to the session object.
    //Makes your custom user data (e.g., _id, username) available on the client side.
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};