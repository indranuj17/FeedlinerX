import { resend } from "@/lib/resend";

import { ApiResponse } from "@/types/ApiResponse";

import VerificationEmail from "../../emails/VerificationEmail";

export async function sendVerificationEmail(
    email:string,
    username:string,
    verificationCode:string,
):Promise<ApiResponse>{

    try {

  resend.emails.send({
  from: 'onboarding@resend.dev',
  to: email,
  subject: 'Hello World',
  react:VerificationEmail({username:username,otp:verificationCode})
  });
    return { success: true, message: 'Verification email sent successfully.' };
     
    
    } catch (emailError) {

        console.log("Error in the verificationEmails",emailError);
        return ({message:"Failed to send verification Email", success:false});
    }
}