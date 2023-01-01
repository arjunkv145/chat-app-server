const mongoose = require('mongoose')
const { Schema } = mongoose

const MemberSchema = new Schema({
    userName: {
        type: String,
        default: ''
    },
    view: {
        type: Boolean,
        default: false
    }
})

const ChatSchema = new Schema(
    {
        chatId: {
            type: String,
            default: ''
        },
        chatType: {
            type: String,
            enum: ['DM', 'GroupChat'],
            default: 'DM'
        },
        groupChatName: {
            type: String,
            default: ''
        },
        members: {
            type: [MemberSchema]
        },
        totalMessageCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
)

const Chat = mongoose.model('Chat', ChatSchema)

module.exports = Chat
