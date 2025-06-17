import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


//Code should effectively manage the scenerios-->
//1)Registering a new user
//2)Updating an existing user but unverified with verification code and new password



//if(existing user by email)exists{
//   if->Verified. then->success:false
//   else ->Save the updated user
//}

//else{
//Create the  new user with the user details
//Save the new user
//}

 export async function POST(request:Request){
    await dbConnect();

    try {
        
        const {username,email,password}=await request.json()


        const existingUserVerifiedbyUsername=await UserModel.findOne({
            username,
            isVerified:true //for the given userna,e
         })




         if(existingUserVerifiedbyUsername){
            return Response.json(
                {
                    success:false,
                    message:"Username is already taken"
                },{status:404}
            )
         }





const existingUserbyEmail=await UserModel.findOne({email});

 let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

if(existingUserbyEmail){
   if(existingUserbyEmail.isVerified){
   return Response.json({
   success:false,
   message:"User already exists with this email"
})
   }
   else{
      const hashedPassword=await bcrypt.hash(password,10);
      existingUserbyEmail.password=hashedPassword;
      existingUserbyEmail.verifyCode=verifyCode;
      existingUserbyEmail.verifyCodeExpiry=new Date(Date.now()+3600000);

      await existingUserbyEmail.save();

        //Send Verification email
      const emailResponse=await sendVerificationEmail(
        email,
        username,
        verifyCode
      )
      if (!emailResponse.success) {

      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }
   }
}





else{
            const hashedPassword=await bcrypt.hash(password,10);
            const expiryDate=new Date();
            expiryDate.setHours(expiryDate.getHours()+1);


        const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });
      await newUser.save();

        //Send Verification email
      const emailResponse=await sendVerificationEmail(
        email,
        username,
        verifyCode
      )
      if (!emailResponse.success) {

      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }
}




    return  Response.json(
        {
            success:true,
            message:"User registered successfully"
        },{status:200}
    );


}


     catch (error) {
        console.log("Error in registering User",error);
         return Response.json(
            {
                success:false,
                message:"Error in registering user"
            },
            {
                status:500
            }
            
         )
    }
 }