const mongoose = require('mongoose')
const { Schema } = mongoose

const ChatsSchema = new Schema({
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
        default: false,
    },
    requestSent: {
        type: Boolean,
        default: false,
    },
    view: {
        type: Boolean,
        default: true,
    },
})

const ChatSchema = new Schema({
    userName: {
        type: String,
        default: "",
    },
    chats: [ChatsSchema],
})

const Chat = mongoose.model('Chat', ChatSchema)

module.exports = Chat