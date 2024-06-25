import Group from "../models/GroupModel.js"
import { uploadOnCloudinary } from '../helpers/cloudinary.js'
import { json } from "express"

const createGroup = async (req, res) => {
    const { name, admin, members } = req.body

    console.log("members : ", members.split(','))

    let profilePic_LocalPath = req.file?.path;
        // console.log(profilePic_LocalPath);
        let profile_pic
        if(profilePic_LocalPath){
            profile_pic = await uploadOnCloudinary(profilePic_LocalPath)
            console.log(profile_pic);
        }

    try {
        const group = await Group.create({ 
            name, 
            admin, 
            members: members.split(',').map(id => id.trim()),
            profile_pic: profile_pic?.url || "https://res.cloudinary.com/sankalpgupta/image/upload/v1719177054/convohub/lyylpnhzh8nnfharctgm.webp"
        })
        res.status(201).json({ message: "Group created successfully", group, success:true })
    } catch (error) {
        res.status(500).json({ message: "Error creating group", error })
    }


}

export default createGroup