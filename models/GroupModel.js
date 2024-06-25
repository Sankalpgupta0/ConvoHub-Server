import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    admin: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    profile_pic : {
        type: String,
    },
    members: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    messages: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Message'
        }
    ]
}, {
    timestamps: true
})

const Group = mongoose.model('Group', groupSchema)

export default Group