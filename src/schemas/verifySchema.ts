import { z } from "zod/v4";


export const verifySchema=z.object({
    code:z.string().min(6,{message:"Code must be of 6 digits"})
});