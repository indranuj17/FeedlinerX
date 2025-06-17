import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';
import { User } from 'next-auth';
import { success } from 'zod/v4';

export async function POST(request:Request){

    await dbConnect();

    const session=await getServerSession(authOptions);
    const user:User=session?.user;

    if(!session || !session.user){
        return Response.json({
            message:"User not authenticated",
            success:false

        },{status:404})
    }

    const userId=user?._id;
    const {acceptMessages}=await request.json();

    try {


        
        
    } catch (error) {
        return Response.json(
            {
                message:"Internal Server Error",
                success:false,
            },{status:500}
        )
    }
}

