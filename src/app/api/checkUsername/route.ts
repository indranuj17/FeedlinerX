
// /app/api/checkUsername/route.ts
import UserModel from "@/models/User";
import dbConnect from "@/lib/db";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    console.log("Received username:", username);

    if (!username) {
      return Response.json(
        { success: false, message: "Username not provided" },
        { status: 400 }
      );
    }

    const findUser = await UserModel.findOne({ username });

    if (!findUser) {
      return Response.json(
        { success: false, message: "User doesn't exist" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "User exists" },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
