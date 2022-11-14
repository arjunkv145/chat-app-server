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
    pending: {
        type: Boolean,
        default: false,
    },
    requestSent: {
        type: Boolean,
        default: false,
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