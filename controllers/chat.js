const Chat = require('../models/chat')
const Message = require('../models/message')

const chats = async (req, res, next) => {
    const { userName } = req.user

    try {
        const chat = await Chat.findOne({ userName })
        if (chat === null) {
            return next({ error: "Failed to create friend collections" })
        }
        res.json({
            success: true,
            chats: chat.chats
        })
    } catch (err) {
        next(err)
    }
}

const chatRoom = async (req, res, next) => {
    const { chatId } = req.params
    const { userName } = req.user

    try {
        const chat = await Chat.findOne({ userName })
        if (chat === null) {
            return next({ error: "Failed to create friend collections" })
        }
        const chatRoom = chat.chats.find(chat => chat.chatId === chatId)
        if (chatRoom === undefined) {
            return res.status(404).json({ message: "Chat doesn't exist" })
        }
        res.json({ chatRoom })
    } catch (err) {
        next(err)
    }
}

const messages = async (req, res, next) => {
    const { chatId } = req.params

    try {
        const message = await Message.findOne({ chatId })
        if (message === null) {
            return next({ error: "Failed to create message collections" })
        }
        res.json({ message })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    chats,
    chatRoom,
    messages
}