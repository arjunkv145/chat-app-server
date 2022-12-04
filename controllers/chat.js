const Chat = require('../models/chat')
const Message = require('../models/message')
const User = require('../models/user')

const chats = async (req, res, next) => {
    const { userName } = req.user

    try {
        const chat = await Chat.findOne({ userName })
        if (chat === null) {
            return next({ error: "Failed to create friend collections" })
        }
        res.json({ chats: chat.chats })
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

const search = async () => {
    const { userName } = req.params
    const { userName: myUserName } = req.user

    try {
        const regex = new RegExp(`/^${userName}/`)
        const user = await User.find({ name: { $regex: regex } }).limit(5)
        const filteredSearch = user.filter(u => u.userName !== myUserName)
        res.json({ search: filteredSearch })
    } catch (err) {
        next(err)
    }
}

const add = async () => {
    const { userName: otherUserName } = req.body
    const { userName } = req.user
    let chatId = ''

    try {
        const chat = await Chat.findOne({ userName })
        if (chat === null) {
            return next({ error: "Failed to create chat collections" })
        }
        const chatIndex = chat.chats.findIndex(i => i.userName === otherUserName)
        if (chatIndex === -1) {
            const otherChat = await Chat.findOne({ userName: otherUserName })
            const otherChatDetails = otherChat.chats.find(c => c.userName === userName)
            if (otherChatDetails === undefined) {
                const { nanoid } = await import('nanoid')
                chatId = nanoid()
                const message = new Message({ chatId, messages: [] })
                await message.save()
            } else {
                chatId = otherChatDetails.chatId
            }
            chat.chats.unshift({
                userName: otherUserName,
                chatId
            })
        } else {
            chat.chats[chatIndex] = {
                ...chat.chats[chatIndex],
                view: true
            }
        }
        await chat.save()

        res.json({ message: 'Chat added' })
    } catch (err) {
        next(err)
    }
}

const remove = async () => {
    const { userName: otherUserName } = req.body
    const { userName } = req.user

    try {
        const chat = await Chat.findOne({ userName })
        if (chat === null) {
            return next({ error: "Failed to create chat collections" })
        }
        const chatIndex = chat.chats.findIndex(i => i.userName === otherUserName)
        chat.chats[chatIndex] = {
            ...chat.chats[chatIndex],
            view: true
        }
        await chat.save()

        res.json({ message: 'Chat removed' })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    chats,
    chatRoom,
    messages,
    search,
    add,
    remove
}