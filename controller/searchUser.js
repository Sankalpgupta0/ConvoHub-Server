import User from '../models/UserModel.js'

async function searchUser(req,response){
    try {
        const { search } = req.body

        const query = new RegExp(search,"i","g")

        const user = await User.find({
            "$or" : [
                { name : query },
                { email : query }
            ]
        }).select("-password")

        return response.json({
            message : 'all user',
            data : user,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}

export default searchUser