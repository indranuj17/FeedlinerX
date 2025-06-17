// username availability check API.



// Import the database connection utility to connect to MongoDB
import dbConnect from "@/lib/db";

// Import Zod library for runtime schema validation
import { z } from "zod";

// Import the Mongoose User model to interact with the 'users' collection
import UserModel from "@/models/User";

// Import reusable username validation logic from signup schema
import { usernameValidation } from "@/schemas/signUpSchema";

// Define a Zod schema for validating query parameters of the request
// This ensures that the 'username' in the query matches our expected format (e.g., no special characters, length constraints, etc.)
const UsernameQuerySchema = z.object({
  username: usernameValidation, // Reuses validation rules from sign-up
});

// Define the handler function for a GET request
export async function GET(request: Request) {
  // Step 1: Connect to the MongoDB database
  // Required before any database operation to avoid "not connected" errors
  await dbConnect();

  try {
    // Step 2: Extract query parameters from the request URL
    const { searchParams } = new URL(request.url); // `request.url` is a full URL string
    const queryParams = {
      username: searchParams.get("username"), // Get the value of the 'username' parameter from the URL
    };

    // Step 3: Validate the extracted query parameters using Zod
    // `safeParse` returns an object with either a success (data) or failure (error)
    const result = UsernameQuerySchema.safeParse(queryParams);

    // If the validation fails, return a 400 Bad Request with error messages
    if (!result.success) {
      // Extract detailed error messages for the 'username' field (if any)
      const usernameErrors = result.error.format().username?._errors || [];

      // Respond with validation errors, or a generic message if none found
      return Response.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ") // Combine multiple error messages if present
              : "Invalid query parameters", // Default fallback message
        },
        { status: 400 } // 400 means client sent bad/invalid data
      );
    }

    // Step 4: Extract the validated username from result
    // Now it's safe to use this data — we know it passed all validation rules
    const { username } = result.data;

    // Step 5: Query the database to see if a verified user already exists with this username
    // This prevents users from choosing a username that's already taken
    const existingVerifiedUser = await UserModel.findOne({
      username, // Look for this exact username
      isVerified: true, // Only check among users who have verified their account (e.g., via email)
    });

    // Step 6: If a user with this username exists and is verified, return a message saying it's taken
    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken", // Clear feedback for frontend
        },
        { status: 200 } // 200 means the request was valid, but the result is "not available"
      );
    }

    // Step 7: If no such user exists, the username is available
    return Response.json(
      {
        success: true,
        message: "Username is unique", // Clear success message
      },
      { status: 200 } // 200 OK — everything worked, username is available
    );
  } catch (error) {
    // Step 8: Catch any unexpected errors (like DB connection issues)
    console.error("Error checking username:", error); // Helpful for debug
