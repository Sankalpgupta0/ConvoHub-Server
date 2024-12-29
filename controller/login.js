import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from "../models/UserModel.js"

async function login(req,response){
    try {
        const { password, userId } = req.body

        const user = await User.findById(userId)

        const verifyPassword = await bcryptjs.compare(password,user.password)

        if(!verifyPassword){
            return response.status(400).json({
                message : "Please check password",
                error : true
            })
        }

        const tokenData = {
            id : user._id,
            email : user.email 
        }
        const token = jwt.sign(tokenData,process.env.JWT_SECREAT_KEY,{ expiresIn : '1d'})

        const cookieOptions = {
            http : true,
            secure : true
        }

        return response.cookie('token',token,cookieOptions).status(200).json({
            message : "Login successfully",
            token : token,
            success :true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}


async function loginUsingPhone(req,res){
    try {
        const { password, email } = req.body
        console.log( "password, email " + password, email)
        if(!email || !password){
            return res.json({
                message : "Please enter all fields",
                success : false
            })
        }
        if (!email.includes("@")) {
            return res.json({
                message: "Please enter a valid email",
                success: false
            });
        }

        const user = await User.findOne({email})
        if(!user){
            return res.json({
                message : "user not found",
                success :false
            })
        }

        const verifyPassword = await bcryptjs.compare(password,user.password)
        if(!verifyPassword){
            return res.json({
                message : "Please check password",
                success :false
            })  
        }

        const tokenData = {
            id : user._id,
            email : user.email 
        }
        const token = jwt.sign(tokenData,process.env.JWT_SECREAT_KEY,{ expiresIn : '1d'})

        const cookieOptions = {
            http : true,
            secure : true
        }

        return res.cookie('token',token,cookieOptions).status(200).json({
            message : "Login successfully",
            token : token,
            success :true,
            user : user
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success :false
        })
    }
}
export {login, loginUsingPhone}