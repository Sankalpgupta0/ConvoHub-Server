import User from "../models/UserModel.js"

async function checkEmail(req,response){
    try {
        const { email } = req.body

        const checkEmail = await User.findOne({email}).select("-password")

        if(!checkEmail){
            return response.status(400).json({
                message : "user not exit",
                error : true
            })
        }

        return response.status(200).json({
            message : "email verify",
            success : true,
            data : checkEmail
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}

export default checkEmail