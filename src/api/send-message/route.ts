import dbConnect from "@/lib/db";
import { Message } from "@/models/User";
import UserModel from "@/models/User";
export async function POST(request: Request) {
  // Step 1: Establish a connection to MongoDB
  await dbConnect();

  // Step 2: Extract `username` and `content` fields from the incoming request's JSON body
  const { username, content } = await request.json();

  try {
    // Step 3: Find the user by username in the database
    const user = await UserModel.findOne({ username });

    // Step 4: If user not found, return a 404 error response
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found"
        },
        { status: 404 }
      );
    }

    // Step 5: Check if the user allows receiving messages
    if (!user.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages"
        },
        { status: 404 }
      );
    }

    // Step 6: Create a new message object with content and a timestamp
    const newMessage = {
      content,
      createdAt: new Date()
    };

    // 🔶 Why `as Message` is important:
    // TypeScript doesn't know that `newMessage` matches the structure of your `Message` interface (from the Mongoose model).
    // So we explicitly assert it using `as Message` to tell the compiler: "trust me, this object follows the Message structure".
    // This is essential for pushing it into the `messages` array, which expects values of type `Message[]`.

    user.messages.push(newMessage as Message);  // Push the new message to the user's messages array

    // Step 7: Save the updated user back to the database
    await user.save();

    // Step 8: Respond with a success message
    return Response.json(
      {
        success: true,
        message: "Message sent successfully"
      },
      { status: 200 }
    );

  } catch (error) {
    // If any error occurs during the try block, catch and log it, then respond with a 500 error
    console.log("Error sending Messages API:", error);
    return Response.json(
      {
        success: false,
        message: "Error sending messages"
      },
      { status: 500 }
    );
  }
}
