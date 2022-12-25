const mongoose = require('mongoose')
const { Schema } = mongoose

const SessionSchema = new Schema({
	sessionId: {
		type: Number,
		default: ''
	},
	refreshToken: {
		type: String,
		default: ''
	}
})

const UserNameSchema = new Schema({
	userName: {
		type: String,
		default: ''
	}
})

const UserSchema = new Schema({
	userName: {
		type: String,
		default: ''
	},
	email: {
		type: String,
		default: ''
	},
	password: {
		type: String,
		default: ''
	},
	emailVerified: {
		type: Boolean,
		default: false
	},
	emailVerificationToken: {
		type: String,
		default: ''
	},
	passwordResetToken: {
		type: String,
		default: ''
	},
	refreshToken: {
		type: [SessionSchema]
	},
	blocked: {
		type: [UserNameSchema]
	}
})

const User = mongoose.model('User', UserSchema)

module.exports = User
