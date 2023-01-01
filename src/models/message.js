const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
    userName: {
        type: String,
        default: ''
    }
})

const MSchema = new Schema(
    {
        userName: {
            type: String,
            default: ''
        },
        message: {
            type: String,
            default: ''
        },
        deletedBy: {
            type: [UserSchema]
        },
        starredBy: {
            type: [UserSchema]
        }
    },
    { timestamps: true }
)

const MessageSchema = new Schema({
    chatId: {
        type: String,
        default: ''
    },
    messages: [MSchema]
})

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message
