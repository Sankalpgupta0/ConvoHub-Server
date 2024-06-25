import getUserDetailsFromToken from "../helpers/getUserDetailsFromToken.js"
import User from "../models/UserModel.js"
import { uploadOnCloudinary } from "../helpers/cloudinary.js"

async function updateUserDetails(req,res){
    try {
        const token = req.cookies.token || ""

        const user = await getUserDetailsFromToken(token)
        console.log(user);
        const { name } = req.body
        const profilePic_LocalPath = req.file?.path
        let profile_pic
        if(profilePic_LocalPath){
            profile_pic = await uploadOnCloudinary(profilePic_LocalPath)
            console.log(profile_pic);
            const updateUser = await User.updateOne({ _id : user._id },{
                name,
                profile_pic: profile_pic?.url
            })
            const userInfomation = await User.findById(user._id)
    
            return res.json({
                message : "user update successfully",
                data : userInfomation,
                success : true
            })
        }
        else{
            const updateUser = await User.updateOne({ _id : user._id },{
                name,
                profile_pic: user.profile_pic
            })
            const userInfomation = await User.findById(user._id)
    
            return res.json({
                message : "user update successfully",
                data : userInfomation,
                success : true
            })
        }
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}

export default updateUserDetails