const mongoose = require('mongoose')
const { Schema } = mongoose

const SessionSchema = new Schema({
    refreshToken: {
        type: String,
        default: "",
    },
})

const UserSchema = new Schema({
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
        type: [SessionSchema],
    },
})

const User = mongoose.model('User', UserSchema)

module.exports = User