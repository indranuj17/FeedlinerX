import dbConnect from "@/lib/db";
import UserModel from "@/models/User";

// POST route handler to verify a user's account using a code (e.g., email verification)
export async function POST(request: Request) {
  // Establish DB connection
  await dbConnect();

  try {
    // Extract `username` and `code` from request body
    const { username, code } = await request.json();

    console.log(`${username} is sexy`)



    // Find user in DB by username
    const user = await UserModel.findOne({ username });

    // If user not found, return error
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found "
        }
      );
    }

    // Validate verification code and expiry time
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    // If both code is correct and not expired
    if (isCodeValid && isCodeNotExpired) {
      // Mark user as verified
      user.isVerified = true;
      await user.save(); // Persist changes to DB

      return Response.json(
        {
          success: true,
          message: 'Account verified successfully'
        },
        { status: 200 }
      );
    } 
    // If code is expired
    else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: 'Verification code has expired. Please sign up again to get a new code.',
        },
        { status: 400 }
      );
    } 
    // If code is invalid
    else {
      return Response.json(
        {
          success: false,
          message: 'Incorrect verification code'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    // Catch any unexpected errors
    console.error('Error verifying user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error verifying user'
      },
      { status: 500 }
    );
  }
}
