import User from "../models/UserModel.js"
import bcrypt from 'bcryptjs'
import {uploadOnCloudinary} from '../helpers/cloudinary.js'

async function registerUser(req, res) {
    try {
        const { name, email, password } = req.body
        
        const checkEmail = await User.findOne({ email }) //{ name,email}  // null
        
        if (checkEmail) {
            return res.status(400).json({
                message: "Already user exits",
                error: true,
            })
        }
        

        let profilePic_LocalPath = req.file?.path;
        // console.log(profilePic_LocalPath);
        let profile_pic
        if(profilePic_LocalPath){
            profile_pic = await uploadOnCloudinary(profilePic_LocalPath)
            // console.log(profile_pic);
        }

        const salt = await bcrypt.genSalt(10)
        const hashpassword = await bcrypt.hash(password, salt)

        const payload = {
            name,
            email,
            profile_pic : profile_pic?.url || "https://res.cloudinary.com/sankalpgupta/image/upload/v1717257388/default.jpg",
            password: hashpassword
        }

        const user = await User.create(payload)

        return res.status(201).json({
            message: "User created successfully",
            data: user,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        })
    }
}

async function registerUsingPhone(req, res) {
    try {
        const { name, email, password } = req.body
        console.log(name, email, password)
        if(!name || !email || !password){
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
        

        const checkEmail = await User.findOne({ email })

        if (checkEmail) {
            return res.json({
                message: "Already user exits",
                success: false,
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashpassword = await bcrypt.hash(password, salt)

        const payload = {
            name,
            email,
            password: hashpassword
        }

        const user = await User.create(payload) // {name,email,password}

        return res.status(201).json({
            message: "User created successfully",
            user: user,
            success: true
        })

    } catch (error) {
        return res.json({
            message: error.message || error,
            success: false
        })
    }
}

export {registerUser, registerUsingPhone}