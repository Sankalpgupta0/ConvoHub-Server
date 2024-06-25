import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "provide name"]
    },
    email: {
        type: String,
        required: [true, "provide email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "provide password"]
    },
    // currentlyTakingTo: {
    //     type: mongoose.Types.ObjectId,
    //     ref : ['Group', 'Conversation'],
    // },
    profile_pic: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema)

export default User