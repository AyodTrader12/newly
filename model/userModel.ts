import { Schema } from "mongoose"
import { model } from "mongoose"

interface iUser{
    name:string
    email:string
    password:string
    otp:string
    isVerified:boolean
    otpExpiresAt:string
}
interface iUserData extends iUser,Document{}

const userModel = new Schema<iUserData>(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            unique:true,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        otp:{
            type:String,
            required:true
        },
        isVerified:{
            type:Boolean,
            default:false
        },
        otpExpiresAt:{
            type:String,
            
        },
    },
    {timestamps:true}
)

export default model<iUserData>("users",userModel)