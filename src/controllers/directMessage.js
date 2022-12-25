const DirectMessage = require('../models/directMessage')
const User = require('../models/user')
const Message = require('../models/message')

const search = async (req, res, next) => {
	const { userName } = req.params
	const { userName: myUserName } = req.user

	try {
		const regex = new RegExp(`/^${userName}/`)
		const search = await User.find({
			userName: { $regex: regex, $nin: [myUserName] }
		}).limit(10)
		res.json({ search })
	} catch (err) {
		next(err)
	}
}

const add = async (req, res, next) => {
	const { userName: targetUserName } = req.body
	const { userName } = req.user
	let chatId = ''

	try {
		const directMessage = await DirectMessage.findOne({
			$and: [
				{ members: { userName } },
				{ members: { userName: targetUserName } }
			]
		})
		if (directMessage === null) {
			const { nanoid } = await import('nanoid')
			chatId = nanoid()
			const message = new Message({ chatId, messages: [] })
			await message.save()
			const newDirectMessage = new DirectMessage({
				chatId,
				members: [
					{ userName, chatStarted: true },
					{ userName: targetUserName, chatStarted: false }
				]
			})
			await newDirectMessage.save()
		} else {
			const userIndex = directMessage.members.findIndex(
				u => u.userName === userName
			)
			if (directMessage.members[userIndex].view === false) {
				directMessage.members[userIndex].view = true
				await directMessage.save()
			} else {
				return res.status(422).json({ message: 'Chat already added' })
			}
		}

		res.json({ message: 'Chat added' })
	} catch (err) {
		next(err)
	}
}

const remove = async (req, res, next) => {
	const { userName: targetUserName } = req.body
	const { userName } = req.user

	try {
		const directMessage = await DirectMessage.findOne({
			$and: [
				{ members: { userName } },
				{ members: { userName: targetUserName } }
			]
		})
		if (directMessage === null) {
			return res.status(404).json({ message: 'Not found' })
		}
		const userIndex = directMessage.members.findIndex(
			u => u.userName === userName
		)
		const targetUserIndex = directMessage.members.findIndex(
			u => u.userName === targetUserName
		)
		if (directMessage.members[userIndex].view === true) {
			if (directMessage.members[targetUserIndex].view === true) {
				directMessage.members[userIndex].view = false
				await directMessage.save()
			} else {
				const chatId = directMessage.chatId
				directMessage.deleteOne({ chatId })
				Message.deleteOne({ chatId })
			}
		} else {
			return res.status(422).json({ message: 'Chat already removed' })
		}

		res.json({ message: 'Chat removed' })
	} catch (err) {
		next(err)
	}
}

module.exports = {
	search,
	add,
	remove
}
