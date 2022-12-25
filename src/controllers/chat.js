const DirectMessage = require('../models/directMessage')
const Group = require('../models/group')

const chats = async (req, res, next) => {
	const { userName } = req.user

	try {
		const chat = await DirectMessage.findOne({ userName })
		if (chat === null) {
			return next({ error: 'Failed to create friend collections' })
		}
		res.json({ chats: chat.chats })
	} catch (err) {
		next(err)
	}
}

// const chatRoom = async (req, res, next) => {
// 	const { chatId } = req.params
// 	const { userName } = req.user

// 	try {
// 		const chat = await Chat.findOne({ userName })
// 		if (chat === null) {
// 			return next({ error: 'Failed to create friend collections' })
// 		}
// 		const chatRoom = chat.chats.find((chat) => chat.chatId === chatId)
// 		if (chatRoom === undefined) {
// 			return res.status(404).json({ message: "Chat doesn't exist" })
// 		}
// 		res.json({ chatRoom })
// 	} catch (err) {
// 		next(err)
// 	}
// }

module.exports = {
	chats
	// chatRoom,
}
