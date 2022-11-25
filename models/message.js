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

const MessageSchema = new Schema({
    chatId: {
        type: String,
        default: "",
    },
    messages: [MessagesSchema],
})

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message