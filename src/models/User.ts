// Importing Mongoose and relevant types for TypeScript
import mongoose, { Schema, Document } from 'mongoose';

// Define the TypeScript interface for a Message document


//This defines the shape of a single message.
// Extends Document to inherit Mongoose document functionality (like .save()).
// Used for typing when working with MessageSchema in a TypeScript-safe way.
export interface Message extends Document {
  _id:mongoose.Types.ObjectId,
  content: string;
  createdAt: Date;
}

// Define the Message schema using Mongoose
const MessageSchema: Schema<Message> = new mongoose.Schema({
    _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),  // ensures consistent ObjectId format
  },
  content: {
    type: String,         // Message text content
    required: true,       // This field must be provided
  },
  createdAt: {
    type: Date,           // Date when message was created
    required: true,       // Must always have a timestamp
    default: Date.now,    // Defaults to current time if not provided
  },
});

// Define the TypeScript interface for a User document
export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date; 
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];    // Embedded array of Message subdocuments
}

// Define the User schema using Mongoose
const UserSchema: Schema<User> = new mongoose.Schema({
  username: {
    type: String,                         // User's display name
    required: [true, 'Username is required'],  // Validation error message
    trim: true,                           // Removes whitespace from both ends
    unique: true,                         // No duplicate usernames allowed
  },
  email: {
    type: String,                         // User's email address
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please use a valid email address'], // Regex for basic email format validation
  },
  password: {
    type: String,                         // Hashed password string
    required: [true, 'Password is required'],
  },
  verifyCode: {
    type: String,                         // Code sent for email/OTP verification
    required: [true, 'Verify Code is required'],
  },
  verifyCodeExpiry: {
    type: Date,                           // Expiry timestamp for the verify code
    required: [true, 'Verify Code Expiry is required'],
  },
  isVerified: {
    type: Boolean,                        // Indicates if user's email is verified
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,                        // Can others send messages to this user?
    default: true,
  },
  messages: [MessageSchema],             // Embedding array of Message subdocuments
});

// Create the User model (or reuse if already compiled during hot reload)
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||  // Reuse existing model if it exists
  mongoose.model<User>('User', UserSchema);          // Otherwise, create a new one

// Export the model to use in routes/controllers
export default UserModel;
