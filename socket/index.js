import express from 'express'
import { Server } from 'socket.io'
import http from 'http'
import getUserDetailsFromToken from '../helpers/getUserDetailsFromToken.js'
import User from '../models/UserModel.js'
import Conversation from '../models/ConversationModel.js'
import Message from '../models/MessageModel.js'
import getConversation from '../helpers/getConversation.js'
import getGroups from '../helpers/getGroups.js'
import Group from '../models/GroupModel.js'

const app = express()

/***socket connection */
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true
    }
})

/***
 * socket running at http://localhost:8080/
 */

//online user
const onlineUser = new Set()

io.on('connection', async (socket) => {
    console.log("connect User ", socket.id)

    const token = socket.handshake.auth.token

    //current user details 
    const user = await getUserDetailsFromToken(token)

    //create a room
    socket.join(user?._id.toString())
    onlineUser.add(user?._id?.toString())

    io.emit('onlineUser', Array.from(onlineUser))

    socket.on('message-page', async (userId) => {
        // console.log('userId', userId)
        const userDetails = await User.findById(userId).select("-password")

        const payload = {
            _id: userDetails?._id,
            name: userDetails?.name,
            email: userDetails?.email,
            profile_pic: userDetails?.profile_pic,
            // has() because onlineUser is a set not an array but this function is like Array.include()
            online: onlineUser.has(userId)
        }
        socket.emit('message-user', payload)

        //get previous message
        const getConversationMessage = await Conversation.findOne({
            "$or": [
                { sender: user?._id, receiver: userId },
                { sender: userId, receiver: user?._id }
            ]
        }).populate('messages').sort({ updatedAt: -1 })

        socket.emit('message', getConversationMessage?.messages || [])
    })

    //new message
    socket.on('new message', async (data) => {

        //check conversation is available both user
        let conversation = await Conversation.findOne({
            "$or": [
                { sender: data?.sender, receiver: data?.receiver },
                { sender: data?.receiver, receiver: data?.sender }
            ]
        })

        //if conversation is not available
        if (!conversation) {
            const createConversation = await Conversation({
                sender: data?.sender,
                receiver: data?.receiver
            })
            conversation = await createConversation.save()
        }

        const message = new Message({
            text: data.text,
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
            pdfUrl: data.pdfUrl,
            msgByUserId: data?.msgByUserId,
        })
        const saveMessage = await message.save()

        const updateConversation = await Conversation.updateOne({ _id: conversation?._id }, {
            "$push": { messages: saveMessage?._id }
        })

        const getConversationMessage = await Conversation.findOne({
            "$or": [
                { sender: data?.sender, receiver: data?.receiver },
                { sender: data?.receiver, receiver: data?.sender }
            ]
        }).populate('messages').sort({ updatedAt: -1 })


        socket.emit('message', getConversationMessage?.messages || [])
        io.to(data?.receiver).emit('message', getConversationMessage?.messages || [])

        //send conversation
        const conversationSender = await getConversation(data?.sender)
        const conversationReceiver = await getConversation(data?.receiver)

        io.to(data?.sender).emit('conversation', conversationSender)
        io.to(data?.receiver).emit('conversation', conversationReceiver)
    })

    //sidebar for conversations
    socket.on('sidebar-conv', async (currentUserId) => {
        console.log("current user", currentUserId)
        const conversation = await getConversation(currentUserId)

        socket.emit('conversation', conversation)
    })

    //sidebar for groups
    socket.on('sidebar-group', async (currentUserId) => {
        const group = await getGroups(currentUserId)
        // console.log('group : ', group)
        socket.emit('group', group)
    })

    socket.on('seen', async (msgByUserId) => {

        let conversation = await Conversation.findOne({
            "$or": [
                { sender: user?._id, receiver: msgByUserId },
                { sender: msgByUserId, receiver: user?._id }
            ]
        })

        const conversationMessageId = conversation?.messages || []

        const updateMessages = await Message.updateMany(
            { _id: { "$in": conversationMessageId }, msgByUserId: msgByUserId },
            { "$set": { seen: true } }
        )

        //send conversation
        const conversationSender = await getConversation(user?._id?.toString())
        const conversationReceiver = await getConversation(msgByUserId)

        io.to(user?._id?.toString()).emit('conversation', conversationSender)
        io.to(msgByUserId).emit('conversation', conversationReceiver)
    })


    const userCurrentGroup = {};
    socket.on('joinGroup', async (data) => {
        const userId = socket.id; // Assuming socket.id is used to uniquely identify the user
        
        // Leave the current group if the user is already in a group
        if (userCurrentGroup[userId]) {
            socket.leave(userCurrentGroup[userId]);
            console.log(`User ${userId} left group ${userCurrentGroup[userId]}`);
        }
    
        // Join the new group
        socket.join(data);
        console.log(`User ${userId} joined group ${data}`);
        userCurrentGroup[userId] = data; // Update the current group for the user
    
        const groupDetails = await Group.findById(data).populate('members');
        socket.emit("groupDetails", groupDetails);
    
        const getGroupMessage = await Group.findOne({
            _id: data
        }).populate('messages').sort({ updatedAt: -1 });
    
        // Send chat messages only to the group members
        socket.emit('group chat', getGroupMessage?.messages || []);
    });

    socket.on("new group message", async (data) => {
        // console.log('new group message', data)
        const group = await Group.findById(data.receiver)
        const message = await Message.create({
            text: data.text,
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
            pdfUrl: data.pdfUrl,
            msgByUserId: data?.sender,
        })
        // console.log(group)
        group.messages.push(message)
        await group.save()

        const getGroupMessage = await Group.findOne({
            _id: group._id
        }).populate('messages').sort({ updatedAt: -1 })

        io.to(data.receiver).emit('group chat', getGroupMessage?.messages || [])
    })

    //disconnect
    socket.on('disconnect', () => {
        onlineUser.delete(user?._id?.toString())
        console.log('disconnect user ', socket.id)
    })
})


export {
    app,
    server
}

