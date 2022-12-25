const Message = require('../models/message')

const messages = async (req, res, next) => {
	const { chatId } = req.params

	try {
		const message = await Message.findOne({ chatId })
		if (message === null) {
			return res.status(404).json({ message: 'Not found' })
		}
		res.json({ message })
	} catch (err) {
		next(err)
	}
}

module.exports = {
	messages
}
