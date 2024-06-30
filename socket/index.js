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

// Online user tracking
const onlineUser = new Set()
// Track the current chat or group each user is viewing
const userCurrentView = {};

io.on('connection', async (socket) => {
    // console.log("connect User ", socket.id)

    const token = socket.handshake.auth.token

    // Current user details 
    const user = await getUserDetailsFromToken(token)

    // Create a room for the user
    socket.join(user?._id.toString())
    onlineUser.add(user?._id?.toString())

    io.emit('onlineUser', Array.from(onlineUser))

    socket.on('message-page', async (userId) => {
        // Set the current chat the user is viewing
        userCurrentView[user._id] = { type: 'chat', id: userId };

        const userDetails = await User.findById(userId).select("-password")

        const payload = {
            _id: userDetails?._id,
            name: userDetails?.name,
            email: userDetails?.email,
            profile_pic: userDetails?.profile_pic,
            online: onlineUser.has(userId)
        }
        socket.emit('message-user', payload)

        // Get previous messages
        const getConversationMessage = await Conversation.findOne({
            "$or": [
                { sender: user?._id, receiver: userId },
                { sender: userId, receiver: user?._id }
            ]
        }).populate('messages').sort({ updatedAt: -1 })

        socket.emit('message', getConversationMessage?.messages || [])
    })

    // New message
    socket.on('new message', async (data) => {
        // console.log(userCurrentView)

        let conversation = await Conversation.findOne({
            "$or": [
                { sender: data?.sender, receiver: data?.receiver },
                { sender: data?.receiver, receiver: data?.sender }
            ]
        })

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

        await Conversation.updateOne({ _id: conversation?._id }, {
            "$push": { messages: saveMessage?._id }
        })

        const getConversationMessage = await Conversation.findOne({
            "$or": [
                { sender: data?.sender, receiver: data?.receiver },
                { sender: data?.receiver, receiver: data?.sender }
            ]
        }).populate('messages').sort({ updatedAt: -1 })

        // Emit message to sender and receiver
        socket.emit('message', getConversationMessage?.messages || [])
        if(userCurrentView[data?.receiver] && userCurrentView[data?.receiver]?.id == data?.sender){
            io.to(data?.receiver).emit('message', getConversationMessage?.messages || [])
        }

        // Send updated conversation lists
        const conversationSender = await getConversation(data?.sender)
        const conversationReceiver = await getConversation(data?.receiver)

        io.to(data?.sender).emit('conversation', conversationSender)
        io.to(data?.receiver).emit('conversation', conversationReceiver)
    })

    // Sidebar for conversations
    socket.on('sidebar-conv', async (currentUserId) => {
        // console.log("current user", currentUserId)
        const conversation = await getConversation(currentUserId)

        socket.emit('conversation', conversation)
    })

    // Sidebar for groups
    socket.on('sidebar-group', async (currentUserId) => {
        const group = await getGroups(currentUserId)
        // console.log(group)
        socket.emit('group', group)
    })

    // Seen message
    socket.on('seen', async (msgByUserId) => {
        let conversation = await Conversation.findOne({
            "$or": [
                { sender: user?._id, receiver: msgByUserId },
                { sender: msgByUserId, receiver: user?._id }
            ]
        })

        const conversationMessageId = conversation?.messages || []

        await Message.updateMany(
            { _id: { "$in": conversationMessageId }, msgByUserId: msgByUserId },
            { "$set": { seen: true } }
        )

        const conversationSender = await getConversation(user?._id?.toString())
        const conversationReceiver = await getConversation(msgByUserId)

        io.to(user?._id?.toString()).emit('conversation', conversationSender)
        io.to(msgByUserId).emit('conversation', conversationReceiver)
    })

    // Join a group
    socket.on('joinGroup', async (data) => {
        // Leave the current group if the user is already in a group
        if (userCurrentView[user._id]?.type === 'group') {
            socket.leave(userCurrentView[user._id].id);
            // console.log(`User ${user._id} left group ${userCurrentView[user._id].id}`);
        }

        // Set the current group the user is viewing
        userCurrentView[user._id] = { type: 'group', id: data };

        socket.join(data);
        // console.log(`User ${user._id} joined group ${data}`);

        const groupDetails = await Group.findById(data).populate('members');
        socket.emit("groupDetails", groupDetails);

        const getGroupMessage = await Group.findOne({
            _id: data
        }).populate('messages').sort({ updatedAt: -1 });

        // Send chat messages only to the group members
        socket.emit('group chat', getGroupMessage?.messages || []);
    });

    // New group message
    socket.on("new group message", async (data) => {
        console.log(data)
        const group = await Group.findById(data.receiver)
        const message = await Message.create({
            text: data.text,
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
            pdfUrl: data.pdfUrl,
            msgByUserId: data?.sender,
        })
        group.messages.push(message)
        await group.save()

        const getGroupMessage = await Group.findOne({
            _id: group._id
        }).populate('messages').sort({ updatedAt: -1 })


        io.to(data.receiver).emit('group chat', getGroupMessage?.messages || [])

        const groupLastMsg = await getGroups(data?.sender)
        // console.log(groupLastMsg)
        socket.emit('group', groupLastMsg)

        // get all groups of userId and then send it to userId
    })

    // Disconnect
    socket.on('disconnect', () => {
        onlineUser.delete(user?._id?.toString())
        delete userCurrentView[socket.id];
        // console.log('disconnect user ', socket.id)
    })
})

export {
    app,
    server
}
