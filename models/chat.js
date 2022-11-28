const mongoose = require('mongoose')
const { Schema } = mongoose

const ChatUserSchema = new Schema({
    userName: {
        type: String,
        default: "",
    },
    chatId: {
        type: String,
        default: "",
    },
    friends: {
        type: Boolean,
        default: false,
    },
    pending: {
        type: Boolean,
        default: true,
    },
})

const ChatSchema = new Schema({
    userName: {
        type: String,
        default: "",
    },
    chats: [ChatUserSchema],
})

const Chat = mongoose.model('Chat', ChatSchema)

module.exports = Chat