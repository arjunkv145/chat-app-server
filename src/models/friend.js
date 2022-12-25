const mongoose = require('mongoose')
const { Schema } = mongoose

const FriendSchema = new Schema({
	requestFrom: {
		type: String,
		default: ''
	},
	requestTo: {
		type: String,
		default: ''
	},
	pending: {
		type: Boolean,
		default: true
	},
})

const Friend = mongoose.model('Friend', FriendSchema)

module.exports = Friend
