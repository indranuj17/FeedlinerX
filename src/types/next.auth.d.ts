// Import types from next-auth
import "next-auth";

// Extend the NextAuth module
declare module 'next-auth' {
  
  // Extending the default User object returned by NextAuth
  interface User {
    _id?: string;                    // MongoDB user ID (optional)
    isVerified?: boolean;           // Indicates if user's email/account is verified
    isAcceptingMessages?: boolean;  // Custom flag: whether user accepts messages (e.g., in a chat app)
    username?: string;              // Custom username for the user (optional)
  }

  // Extending the Session object to include our custom fields from User
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
    } & DefaultSession['user'];     // Merge with the default session user fields (e.g., name, email)
  }
}

// Extend JWT payload type from next-auth/jwt
declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;                    // Include user ID in JWT
    isVerified?: boolean;           // Carry verification status in JWT
    isAcceptingMessages?: boolean;  // Include custom flag in JWT
    username?: string;              // Add username to JWT
  }
}
