const mongoose = require('mongoose')
const { Schema } = mongoose

const FriendUserNameSchema = new Schema({
    userName: {
        type: String,
        default: "",
    },
})
const PendingRequestSchema = new Schema({
    userName: {
        type: String,
        default: "",
    },
})

const FriendSchema = new Schema({
    userName: {
        type: String,
        default: "",
    },
    friends: [FriendUserNameSchema],
    pendingRequest: [PendingRequestSchema],
})

const Friend = mongoose.model('Friend', FriendSchema)

module.exports = Friend