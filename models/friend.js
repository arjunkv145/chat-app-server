const mongoose = require('mongoose')
const { Schema } = mongoose

const UserNameSchema = new Schema({
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
    friends: [UserNameSchema],
    pending: [UserNameSchema],
    blocked: [UserNameSchema],
})

const Friend = mongoose.model('Friend', FriendSchema)

module.exports = Friend