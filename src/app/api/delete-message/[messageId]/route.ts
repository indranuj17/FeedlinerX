import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { authOptions } from "../../auth/[...nextauth]/option"; 
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import mongoose from "mongoose";






export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } }
) {



  await dbConnect();

  const session = await getServerSession(authOptions);
  const userId = session?.user?._id;

  if (!session || !userId) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const messageid = params.messageId;
  console.log(`Receievd Message id is ${messageid}`);

  // ✅ Validate ObjectId before use
  if (!mongoose.Types.ObjectId.isValid(messageid)) {
    return Response.json(
      { success: false, message: "Invalid message ID" },
      { status: 400 }
    );
  }

  const objectId = new mongoose.Types.ObjectId(messageid);

  try {
    const updatedResponse = await UserModel.updateOne(
      { _id: userId },
      { $pull: { messages: { _id: objectId } } }
    );

    if (updatedResponse.modifiedCount === 0) {
      return Response.json(
        { success: false, message: "Message not found or already deleted" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Message Deleted Successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error in DELETE route:", error.message);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
