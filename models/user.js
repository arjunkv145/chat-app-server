const mongoose = require('mongoose')
const { Schema } = mongoose

const Session = new Schema({
    refreshToken: {
        type: String,
        default: "",
    },
})

const userSchema = new Schema({
    userName: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        default: "",
    },
    password: {
        type: String,
        default: "",
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
        default: "",
    },
    passwordResetToken: {
        type: String,
        default: "",
    },
    refreshToken: {
        type: [Session],
    },
})

const User = mongoose.model('User', userSchema)

module.exports = User