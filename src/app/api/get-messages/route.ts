import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  // Establish database connection
  await dbConnect();

  // Get the currently authenticated user session using NextAuth
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  // If no session or user found, return an unauthorized error
  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Convert user's string ID to MongoDB's ObjectId type
  const userId = new mongoose.Types.ObjectId(_user._id);

  try {
    // Aggregate the user document and sort their messages in reverse chronological order
    const user = await UserModel.aggregate([
      // 1. Match the document of the currently logged-in user
      { $match: { _id: userId } },

      // 2. Deconstruct the `messages` array, so each message becomes a separate document
      { $unwind: '$messages' },

      // 3. Sort these "flattened" message documents by their creation time (most recent first)
      { $sort: { 'messages.createdAt': -1 } },

      // 4. Re-group the documents back into a single document with a `messages` array,
      //    now sorted by most recent first
      {
        $group: {
          _id: '$_id',
          messages: { $push: '$messages' }, // re-build the array from sorted docs
        },
      },
    ]).exec(); // Execute the aggregation query

    // Now `user[0].messages` contains all messages sorted by `createdAt` DESC


    if(!user || user.length===0){
      return Response.json(
        {
          success:false,
          message:"User not found"
        },{status:402}
      )
    }


    return Response.json(
      {
        success:true,
        messages:user[0].messages
      }
    )

  } catch (error) {
    console.log("Error in get Message API (GET):", error);
    return Response.json({
      message: "Error getting messages ",
      success: false
    }, { status: 500 });
  }
}




