const User = require('../models/user')
const Friend = require('../models/friend')
const Chat = require('../models/chat')
const Message = require('../models/message')

const request = async (req, res, next) => {
    const { userName } = req.user
    const { userName: otherUserName } = req.body

    try {
        if (!otherUserName) {
            return res.status(400).json({ message: "Username not provided" })
        }
        if (userName === otherUserName) {
            return res.status(422).json({ message: "Can't send request" })
        }
        const user = await User.findOne({ userName: otherUserName })
        if (user === null) {
            return res.status(404).json({ message: "User doesn't exist" })
        }


        const friend = await Friend.findOne({ userName })
        const chat = await Chat.findOne({ userName })
        const otherChat = await Chat.findOne({ userName: otherUserName })


        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        if (friend.friends.find(friend => friend.userName === otherUserName) !== undefined) {
            return res.status(422).json({ message: "Already friends" })
        }
        if (friend.pendingRequest.find(request => request.userName === otherUserName) !== undefined) {
            return res.status(422).json({ message: "Already sent request" })
        }

        if (chat === null) {
            return next({ error: "Failed to create chat collections" })
        }
        if (chat.chats.find(chat => chat.userName === otherUserName) !== undefined) {
            return res.status(422).json({ message: "This user has already sent you a request" })
        }

        const { nanoid } = await import('nanoid')
        const chatId = nanoid()

        if (otherChat === null) {
            return next({ error: "Failed to create chat collections for the user you are sending request" })
        }

        friend.pendingRequest.unshift({ userName: otherUserName })
        await friend.save()
        otherChat.chats.unshift({ userName, chatId })
        await otherChat.save()

        res.json({ message: 'Request sent successfully' })
    } catch (err) {
        next(err)
    }
}

const pending = async (req, res, next) => {
    const { userName } = req.user
    try {
        const friend = await Friend.findOne({ userName })
        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        res.json({ pendingRequest: friend.pendingRequest })
    } catch (err) {
        next(err)
    }
}

const friends = async (req, res, next) => {
    const { userName } = req.user
    try {
        const friend = await Friend.findOne({ userName })
        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        res.json({ friends: friend.friends })
    } catch (err) {
        next(err)
    }
}

const accept = async (req, res, next) => {
    const { userName } = req.user
    const { userName: otherUserName, chatId } = req.body

    try {
        if (!otherUserName) {
            return res.status(400).json({ message: "Username not provided" })
        }

        const friend = await Friend.findOne({ userName })
        const otherFriend = await Friend.findOne({ userName: otherUserName })
        const chat = await Chat.findOne({ userName })
        const otherChat = await Chat.findOne({ userName: otherUserName })
        const message = new Message({ chatId, messages: [] })

        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        if (otherFriend === null) {
            return next({ error: "Failed to create friend collections for the user you are sending request" })
        }
        if (chat === null) {
            return next({ error: "Failed to create chat collections" })
        }
        if (otherChat === null) {
            return next({ error: "Failed to create chat collections for the user you are sending request" })
        }

        const chatIndex = chat.chats.findIndex(i => i.userName === otherUserName)

        chat.chats[chatIndex] = {
            userName: otherUserName,
            chatId,
            friends: true,
            pending: false,
        }
        otherChat.chats.unshift({
            userName,
            chatId,
            friends: true,
            pending: false,
        })

        const pendingRequestIndex = otherFriend.pendingRequest.findIndex(i => i.userName = userName)
        otherFriend.pendingRequest.splice(pendingRequestIndex, 1)

        friend.friends.unshift({ userName: otherUserName })
        otherFriend.friends.unshift({ userName })
        await friend.save()
        await otherFriend.save()
        await chat.save()
        await otherChat.save()
        await message.save()

        res.json({ message: 'You are now friends' })
    } catch (err) {
        next(err)
    }
}

const reject = async (req, res, next) => {
    const { userName } = req.user
    const { userName: otherUserName } = req.body

    try {
        if (!otherUserName) {
            return res.status(400).json({ message: "Username not provided" })
        }

        const otherFriend = await Friend.findOne({ userName: otherUserName })
        const chat = await Chat.findOne({ userName })

        if (otherFriend === null) {
            return next({ error: "Failed to create friend collections for the user you are sending request" })
        }
        if (chat === null) {
            return next({ error: "Failed to create chat collections" })
        }

        const chatIndex = chat.chats.findIndex(i => i.userName === otherUserName)
        const pendingRequestIndex = otherFriend.pendingRequest.findIndex(i => i.userName = userName)

        chat.chats.splice(chatIndex, 1)
        otherFriend.pendingRequest.splice(pendingRequestIndex, 1)

        await otherFriend.save()
        await chat.save()

        res.json({ message: 'You have rejected the friend request' })
    } catch (err) {
        next(err)
    }
}

const unfriend = async (req, res, next) => {
    const { userName } = req.user
    const { userName: otherUserName, chatId } = req.body

    try {
        if (!otherUserName) {
            return res.status(400).json({ message: "Username not provided" })
        }

        const friend = await Friend.findOne({ userName })
        const otherFriend = await Friend.findOne({ userName: otherUserName })
        const chat = await Chat.findOne({ userName })
        const otherChat = await Chat.findOne({ userName: otherUserName })

        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        if (otherFriend === null) {
            return next({ error: "Failed to create friend collections for the user you are sending request" })
        }
        if (chat === null) {
            return next({ error: "Failed to create chat collections" })
        }
        if (otherChat === null) {
            return next({ error: "Failed to create chat collections for the user you are sending request" })
        }

        const chatIndex = chat.chats.findIndex(i => i.userName === otherUserName)
        const otherChatIndex = otherChat.chats.findIndex(i => i.userName === userName)

        const friendIndex = friend.friends.findIndex(i => i.userName = otherUserName)
        const otherFriendIndex = otherFriend.friends.findIndex(i => i.userName = userName)

        const chatId = chat.chats[chatIndex].chatId
        await Message.deleteOne({ chatId })

        chat.chats.splice(chatIndex, 1)
        otherChat.chats.splice(otherChatIndex, 1)
        friend.friends.splice(friendIndex, 1)
        otherFriend.friends.splice(otherFriendIndex, 1)

        await friend.save()
        await otherFriend.save()
        await chat.save()
        await otherChat.save()

        res.json({ friends: friend.friends })
    } catch (err) {
        next(err)
    }
}

const cancelPendingRequest = async (req, res, next) => {
    const { userName } = req.user
    const { userName: otherUserName, chatId } = req.body

    try {
        if (!otherUserName) {
            return res.status(400).json({ message: "Username not provided" })
        }

        const friend = await Friend.findOne({ userName })
        const otherChat = await Chat.findOne({ userName: otherUserName })

        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        if (otherChat === null) {
            return next({ error: "Failed to create chat collections for the user you are sending request" })
        }

        const friendIndex = friend.pendingRequest.findIndex(i => i.userName = otherUserName)
        const otherChatIndex = otherChat.chats.findIndex(i => i.userName === userName)

        friend.pendingRequest.splice(friendIndex, 1)
        otherChat.chats.splice(otherChatIndex, 1)

        await friend.save()
        await otherChat.save()

        res.json({ message: 'You have cancelled your friend request' })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    request,
    pending,
    friends,
    accept,
    reject,
    unfriend,
    cancelPendingRequest
}