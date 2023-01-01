const Chat = require('../models/chat')
const User = require('../models/user')
const Message = require('../models/message')

const chats = async (req, res, next) => {
    const { userName } = req.user

    try {
        const chats = await Chat.find({ members: { userName } }).sort({
            updatedAt: 1
        })
        res.json({ chats: chats })
    } catch (err) {
        next(err)
    }
}

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
    const { members, groupChatName = '' } = req.body
    const { userName } = req.user
    let chatId
    const { nanoid } = await import('nanoid')
    let message

    try {
        if (members.length === 1) {
            const chat = await Chat.findOne({
                $and: [
                    { members: { userName } },
                    { members: { userName: members[0] } }
                ]
            })
            if (chat === null) {
                chatId = nanoid()
                message = new Message({ chatId, messages: [] })
                await message.save()
                const newChat = new Chat({
                    chatId,
                    members: [
                        { userName, chatStarted: true },
                        { userName: members[0], chatStarted: false }
                    ]
                })
                await newChat.save()
            } else {
                const userIndex = chat.members.findIndex(
                    (u) => u.userName === userName
                )
                if (chat.members[userIndex].view === false) {
                    chat.members[userIndex].view = true
                    await chat.save()
                } else {
                    return res
                        .status(422)
                        .json({ message: 'Chat already added' })
                }
            }
        } else if (members.length > 1) {
            chatId = nanoid()
            message = new Message({ chatId, messages: [] })
            await message.save()
            const newGroupChat = new Chat({
                chatId,
                chatType: 'GroupChat',
                groupChatName,
                members: members.map((userName) => ({
                    userName,
                    chatStarted: true
                }))
            })
            await newGroupChat.save()
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
        const chat = await Chat.findOne({
            $and: [
                { members: { userName } },
                { members: { userName: targetUserName } },
                { chatType: 'DM' }
            ]
        })
        if (chat === null) {
            return res.status(404).json({ message: 'Not found' })
        }
        const userIndex = chat.members.findIndex((u) => u.userName === userName)
        const targetUserIndex = chat.members.findIndex(
            (u) => u.userName === targetUserName
        )
        if (chat.members[userIndex].view === true) {
            const chatId = chat.chatId
            if (chat.members[targetUserIndex].view === true) {
                chat.members[userIndex].view = false
                await chat.save()
                const messageCollection = await Message.findOne({ chatId })
                messageCollection.messages = messageCollection.messages.map(
                    (m) => m.deletedBy.push({ userName })
                )
                await messageCollection.save()
            } else {
                await chat.deleteOne({ chatId })
                await Message.deleteOne({ chatId })
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
    chats,
    search,
    add,
    remove
}
