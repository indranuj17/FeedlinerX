import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { authOptions } from "../../auth/[...nextauth]/option";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const userId = session?.user?._id;

  if (!session || !userId) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  // ✅ Extract the messageId from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const messageId = pathParts[pathParts.length - 1]; // Get last part of the URL

  console.log(`Received Message ID: ${messageId}`);

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return Response.json({ success: false, message: "Invalid message ID" }, { status: 400 });
  }

  try {
    const updatedResponse = await UserModel.updateOne(
      { _id: userId },
      { $pull: { messages: { _id: new mongoose.Types.ObjectId(messageId) } } }
    );

    if (updatedResponse.modifiedCount === 0) {
      return Response.json({ success: false, message: "Message not found or already deleted" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Message Deleted Successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Delete error:", error);
    return Response.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
