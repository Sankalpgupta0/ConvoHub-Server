import getUserDetailsFromToken from "../helpers/getUserDetailsFromToken.js"
import User from "../models/UserModel.js"

async function userDetails(req,response){
    try {
        const token = req.cookies.token || ""

        const user = await getUserDetailsFromToken(token)

        return response.status(200).json({
            message : "user details",
            data : user
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}

async function getUserDetailsFromId(req,response){
    try {
        const { userId } = req.body
        // console.log(userId)

        const user = await User.findById(userId)

        return response.status(200).json({
            message : "user details",
            data : user
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            success : false
        })
    }
}

export {userDetails, getUserDetailsFromId}