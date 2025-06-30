import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { authOptions } from "../auth/[...nextauth]/option"; 
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
  // Establish database connection
  await dbConnect();

  // Get the currently authenticated user session using NextAuth  / /to get user info
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
    // ✅ Aggregate pipeline to get sorted messages for the user
    const user = await UserModel.aggregate([
      // 1️⃣ Match only the document belonging to the logged-in user
      { $match: { _id: userId } },

      // 2️⃣ Unwind the messages array — makes each message a separate document
      // NOTE: preserveNullAndEmptyArrays keeps the doc even if messages is empty
      { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true } },

      // 3️⃣ Sort messages by their createdAt field in descending order (latest first)
      { $sort: { 'messages.createdAt': -1 } },

      // 4️⃣ Group the messages back into an array after sorting
      {
        $group: {
          _id: '$_id',               // Group by user ID
          messages: { $push: '$messages' }, // Rebuild sorted messages array
        },
      },
    ]).exec(); // 🔁 Execute aggregation query



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




