const mongoose = require('mongoose')
const { Schema } = mongoose

const MessagesSchema = new Schema({
    userName: {
        type: String,
        default: "",
    },
    message: {
        type: String,
        default: "",
    },
})

const ChatMessageSchema = new Schema({
    chatId: {
        type: String,
        default: "",
    },
    messages: [MessagesSchema],
})

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema)

module.exports = ChatMessage