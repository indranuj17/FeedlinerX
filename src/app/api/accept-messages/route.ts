// Importing session utility from NextAuth to access the current logged-in user
import { getServerSession } from 'next-auth/next';
// Custom auth config
import { authOptions } from '../auth/[...nextauth]/option'; 
// MongoDB connection helper
import dbConnect from '@/lib/db';
// Mongoose user model
import UserModel from '@/models/User';
// Type definition for user session
import { User } from 'next-auth';


// ======================= POST: Update Accept Messages Setting ======================= //
export async function POST(request: Request) {
  // Connect to MongoDB
  await dbConnect();

  // Get current user session
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  // If not authenticated, return 404 error
  if (!session || !session.user) {
    return Response.json({
      message: "User not authenticated",
      success: false
    }, { status: 404 });
  }

  // Extract user ID and request body
  const userId = user?._id;

  const { acceptMessages } = await request.json(); // expect JSON: { acceptMessages: boolean }//this will come from client if he toggles to accep messages or not

  try {
    // Update the user’s message accepting status
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessages: acceptMessages
      },
      { new: true } // return updated document
    );

    // If user not found
    if (!updatedUser) {
      return Response.json({
        success: false,
        message: "Failed to update user status"
      }, { status: 401 });
    }

    // Success response
    return Response.json({
      success: true,
      message: "Message acceptance status updated successfully",
      updatedUser
    }, { status: 200 });

  } catch (error) {
    console.log("Error in accepting Message API (POST):", error);
    return Response.json({
      message: "Internal Server Error",
      success: false
    }, { status: 500 });
  }
}



// ======================= GET: Check If User Accepts Messages ======================= //
export async function GET() {
  // Connect to DB
  await dbConnect();

  // Get current session
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  // Return error if not authenticated
  if (!session || !session.user) {
    return Response.json({
      message: "User not authenticated",
      success: false
    }, { status: 404 });
  }

  const userId = user?._id;

  try {
    // Find the user from DB
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json({
        success: false,
        message: "User not found"
      }, { status: 401 });
    }

    // Return the current status of isAcceptingMessages
    return Response.json({
      success: true,
      isAcceptingMessages: foundUser.isAcceptingMessages,
      message: "User message setting fetched successfully"
    }, { status: 200 });

  } catch (error) {
    console.log("Error in accepting Message API (GET):", error);
    return Response.json({
      message: "Error getting message accepting status",
      success: false
    }, { status: 500 });
  }
}




//getServerSession ensures only authenticated users can access this route.

// ✅ POST method updates the user setting (isAcceptingMessages).