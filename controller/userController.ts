import { Request, Response } from "express"
import  userModel  from "../model/userModel"
import bcrypt from "bcrypt"
import crypto from "crypto"
import jwt from "jsonwebtoken"


export const createAdminAccount = async (req:Request,res:Response) => {
try {
    const{name,email,password} = req.body
    const salt = await bcrypt.genSalt(9)
    const hashed = await bcrypt.hash(salt,password)
   const GenerateOtp = crypto.randomInt(100000,999999).toString()

   const admin = await userModel.create({
   name,
   email,
   password:hashed,
   otp:GenerateOtp,
   otpExpiresAt:new Date(Date.now() + 60 * 60 * 1000).toString(),
   status:"admin"

   })
   return res.status(201).json({
    message:"admin account created",
    data:admin,
    status:201
   })
} catch (error:any) {
    return res.status(404).json({
        message:error.message,
        status:404
    })
}
}

export const createAccount = async(req:Request,res:Response) => {
try {
    const { name, email, password } = req.body

    const userAlreadtyExists = await userModel.findOne({ email })
    if (userAlreadtyExists) {
        return res.status(201).json({ message: "User already exists" })
    }
    const  salt = await bcrypt.genSalt(9)
    const hashedPassword = await bcrypt.hash(password, salt)

    const GenerateOtp = crypto.randomInt(100000, 999999).toString()
   
    const user = await userModel.create({
        name,
        email,
        password:hashedPassword,
        otp:GenerateOtp,
        otpExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toString()

    })
    return res.status(201).json({
        message: "User created successfully",
        data:user,
        status:201
    })
} catch (error:any) {
    return res.status(400).json({
        message: error.message,
        status:400

    })
}
}

const Allusers = async(req:Request,res:Response) => {
    try {
        const users = await userModel.find()
        return res.status(201).json({
            message:"all users",
            data:users,
            status:201
        })

    } catch (error:any) {
        return res.status(400).json({
            message: error.message,
            status:400
        })
        
    }
}
const ReadSingleUser = async(req:Request,res:Response) => {
    try {
        const {userId} = req.params
        const user = await userModel.findById(userId)
        
        return res.status(201).json({
            message:"single user",
            data:user,
            status:201
        })
    } catch (error:any) {
        return res.status(400).json({
            message: error.message,
            status:400
        })
        
    }

}
const UpdateUserInfo = async(req:Request,res:Response) => {
    try {
        const {userId} = req.params
        const {name,email,} = req.body
        const user = await userModel.findByIdAndUpdate(userId,{
            name,
            email,
            
        },{new:true})
        
        return res.status(201).json({
            message:"user info updated",
            data:user,
            status:201
        })
    } catch (error:any) {
        return res.status(400).json({
            message: error.message,
            status:400
        })
        
    }

}
const DeleteUser = async(req:Request,res:Response) => {
    try {
        const {userId} = req.params
        const user = await userModel.findByIdAndDelete(userId)
        
        return res.status(201).json({
            message:"account deleted",
            data:user,
            status:201
        })
    } catch (error:any) {
        return res.status(400).json({
            message: error.message,
            status:400
        })
        
    }

}

const VerifyUser = async(req:Request,res:Response) => {
  try {
    
    const {otp} = req.body
    if(!otp){
        return res.status(404).json({message:"otp is required"})
    }
    const user = await userModel.findOne({otp})
    if(!user){
        return res.status(404).json({message:"invalid otp"})
    }
    const isOtpValid = user.otp === otp && new Date(user.otpExpiresAt) > new Date();
    if (!isOtpValid) {
        return res.status(404).json({ message: "Invalid or expired OTP", status: 404 });
    }
    user.isVerified = true;
    user.otp = "";
    user.otpExpiresAt = ""
    await user.save()
    
    return res.status(201).json({
        message: "user verified successfully",
        data:user,
        status:201
    })
  } catch (error:any) {
    return res.status(400).json({
        message: error.message,
        status:400
    })
    
  }

}

const LoginUser = async(req:Request,res:Response) => {
    try {
        const {email,password} = req.body
        if(!email || !password){
            return res.status(404).json({message:"all fields are required"})
        }
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).json({message:"user not found"})
        }
        const isPasswordMatched = await bcrypt.compare(password,user.password)
        if(isPasswordMatched){
            if(user.password && user.otp === ""){
                const token = jwt.sign({id:user._id},process.env.JWT_SECRET as string,{expiresIn:"1d"})

                return res.status(201).json({
                    message:"login successful",
                    data:user,
                    token:token,
                    status:201
                })
            }else{
                return res.status(404).json({
                    message:"user not verified",
                    status:404
                })
            }
        } else{
            return res.status(404).json({
                message:"password not matched",
                status:404
            })
        }

      
        
        
    } catch (error:any) {
        return res.status(400).json({
            message: error.message,
            status:400
        })
        
    }

}

const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ message: "Email is required", status: 404 });
        }

        // Find the user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found", status: 404 });
        }

        // Generate a new OTP
        const GenerateOtp = crypto.randomInt(100000, 999999).toString();
        user.otp = GenerateOtp;
        user.otpExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toString(); // OTP expires in 1hr
        await user.save();

   
        return res.status(201).json({
            message: "OTP sent successfully. Please check your email.",
            status: 201,
        });
    } catch (error: any) {
        return res.status(404).json({
            message: error.message,
            status: 404,
        });
    }
};

const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate input
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP, and new password are required", status: 400 });
        }

        // Find the user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found", status: 404 });
        }

        // Verify the OTP
        const isOtpValid = user.otp === otp && new Date(user.otpExpiresAt) > new Date();
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid or expired OTP", status: 400 });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(9);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password and clear the OTP
        user.password = hashedPassword;
        user.otp = "";
        user.otpExpiresAt = "";
        await user.save();

        return res.status(200).json({
            message: "Password reset successfully",
            status: 200,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: error.message,
            status: 500,
        });
    }
};