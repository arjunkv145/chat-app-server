const User = require('../models/user')
const Friend = require('../models/friend')
const Chat = require('../models/chat')
const Message = require('../models/message')

const request = async (req, res, next) => {
    const { userName: myUserName } = req.user
    const { userName: targetUserName } = req.body
    let chatId = ''

    try {
        if (!targetUserName) {
            return res.status(400).json({ message: "Username not provided" })
        }
        if (myUserName === targetUserName) {
            return res.status(422).json({ message: "Can't send request" })
        }
        const user = await User.findOne({ userName: targetUserName })
        if (user === null) {
            return res.status(404).json({ message: "User doesn't exist" })
        }

        const myChat = await Chat.findOne({ userName: myUserName })
        const targetChat = await Chat.findOne({ userName: targetUserName })

        if (myChat === null) {
            return next({ error: "Failed to create chat collections" })
        }
        if (targetChat === null) {
            return next({ error: "Failed to create chat collections for the user you are sending request" })
        }

        const myChatIndex = myChat.chats.findIndex(i => i.userName === myUserName)
        if (myChatIndex !== -1) {
            if (myChat.chats[myChatIndex].friends === true) {
                return res.status(422).json({ message: "Already friends" })
            }
            if (myChat.chats[myChatIndex].pending === true && myChat.chats[myChatIndex].requestSent === true) {
                return res.status(422).json({ message: "Already sent request" })
            }
            if (myChat.chats[myChatIndex].pending === true && myChat.chats[myChatIndex].requestSent === false) {
                return res.status(422).json({ message: "This user has already sent you a request" })
            }
        }
        const targetChatIndex = targetChat.chats.findIndex(i => i.userName === targetUserName)

        if (myChatIndex === -1) {
            if (targetChatIndex === -1) {
                const { nanoid } = await import('nanoid')
                chatId = nanoid()
                const message = new Message({ chatId, messages: [] })
                await message.save()
            } else {
                chatId = targetChat.chats[targetChatIndex].chatId
            }
            myChat.chats.unshift({
                userName: targetUserName,
                chatId,
                pending: true,
                requestSent: true
            })
        } else {
            myChat.chats[myChatIndex] = {
                ...myChat.chats[myChatIndex],
                pending: true,
                requestSent: true,
            }
            chatId = myChat.chats[myChatIndex].chatId
        }

        if (targetChatIndex === -1) {
            targetChat.chats.unshift({
                myUserName,
                chatId,
                pending: true,
            })
        } else {
            targetChat.chats[targetChatIndex] = {
                ...targetChat.chats[targetChatIndex],
                pending: true,
            }
        }

        await myChat.save()
        await targetChat.save()

        res.json({ message: 'Request sent successfully' })
    } catch (err) {
        next(err)
    }
}

const pending = async (req, res, next) => {
    const { userName } = req.user
    try {
        const myChat = await Chat.findOne({ userName })
        if (myChat === null) {
            return next({ error: "Failed to create chat collections" })
        }
        const pending = myChat.chats.filter(chat => chat.pending === true && chat.requestSent === true)
        res.json({ pending })
    } catch (err) {
        next(err)
    }
}

const friends = async (req, res, next) => {
    const { userName } = req.user
    try {
        const myChat = await Chat.findOne({ userName })
        if (myChat === null) {
            return next({ error: "Failed to create chat collections" })
        }
        const friends = myChat.chats.filter(chat => chat.friends === true)
        res.json({ friends })
    } catch (err) {
        next(err)
    }
}

const accept = async (req, res, next) => {
    const { userName } = req.user
    const { userName: otherUserName } = req.body

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

        chat.chats[chatIndex] = {
            ...chat.chats[chatIndex],
            friends: true,
            pending: false,
            requestSent: false,
            view: true
        }
        otherChat.chats[otherChatIndex] = {
            ...otherChat.chats[otherChatIndex],
            friends: true,
            pending: false,
            requestSent: false,
            view: true
        }

        const pendingIndex = otherFriend.pending.findIndex(i => i.userName = userName)
        otherFriend.pending.splice(pendingIndex, 1)

        friend.friends.unshift({ userName: otherUserName })
        otherFriend.friends.unshift({ userName })
        await friend.save()
        await otherFriend.save()
        await chat.save()
        await otherChat.save()

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
        const otherChat = await Chat.findOne({ userName: otherUserName })

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
        const pendingIndex = otherFriend.pending.findIndex(i => i.userName = userName)

        chat.chats[chatIndex] = {
            ...chat.chats[chatIndex],
            pending: false,
            requestSent: false,
        }
        otherChat.chats[otherChatIndex] = {
            ...otherChat.chats[otherChatIndex],
            pending: false,
            requestSent: false,
        }

        otherFriend.pending.splice(pendingIndex, 1)

        await otherFriend.save()
        await chat.save()
        await otherChat.save()

        res.json({ message: 'You have rejected the request' })
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

        chat.chats[chatIndex] = {
            ...chat.chats[chatIndex],
            friends: false,
        }
        otherChat.chats[otherChatIndex] = {
            ...otherChat.chats[otherChatIndex],
            friends: false,
        }
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
    const { userName: otherUserName } = req.body

    try {
        if (!otherUserName) {
            return res.status(400).json({ message: "Username not provided" })
        }

        const friend = await Friend.findOne({ userName })
        const chat = await Chat.findOne({ userName })
        const otherChat = await Chat.findOne({ userName: otherUserName })

        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        if (chat === null) {
            return next({ error: "Failed to create chat collections" })
        }
        if (otherChat === null) {
            return next({ error: "Failed to create chat collections for the user you are sending request" })
        }

        const friendIndex = friend.pending.findIndex(i => i.userName = otherUserName)
        const chatIndex = chat.chats.findIndex(i => i.userName === otherUserName)
        const otherChatIndex = otherChat.chats.findIndex(i => i.userName === userName)

        friend.pending.splice(friendIndex, 1)
        chat.chats[chatIndex] = {
            ...chat.chats[chatIndex],
            pending: false,
            requestSent: false,
        }
        otherChat.chats[otherChatIndex] = {
            ...otherChat.chats[otherChatIndex],
            pending: false,
            requestSent: false,
        }

        await friend.save()
        await chat.save()
        await otherChat.save()

        res.json({ message: 'You have cancelled your friend request' })
    } catch (err) {
        next(err)
    }
}

const block = async () => {
    const { userName } = req.user
    const { userName: otherUserName } = req.body

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

        const friendIndex = friend.friends.findIndex(i => i.userName = otherUserName)
        const otherFriendIndex = otherFriend.friends.findIndex(i => i.userName = userName)
        const pendingIndex = friend.pending.findIndex(i => i.userName = otherUserName)
        const otherPendingIndex = otherFriend.pending.findIndex(i => i.userName = userName)
        const chatIndex = chat.chats.findIndex(i => i.userName === otherUserName)
        const otherChatIndex = otherChat.chats.findIndex(i => i.userName === userName)

        if (friendIndex !== -1) {
            friend.friends.splice(friendIndex, 1)
        }
        if (otherFriendIndex !== -1) {
            otherFriend.friends.splice(otherFriendIndex, 1)
        }
        if (pendingIndex !== -1) {
            friend.pending.splice(pendingIndex, 1)
        }
        if (otherPendingIndex !== -1) {
            otherFriend.pending.splice(otherPendingIndex, 1)
        }

        chat.chats[chatIndex] = {
            ...chat.chats[chatIndex],
            friends: false,
            pending: false,
            requestSent: false,
        }
        otherChat.chats[otherChatIndex] = {
            ...otherChat.chats[otherChatIndex],
            friends: false,
            pending: false,
            requestSent: false,
        }

        friend.blocked.unshift({ userName: otherUserName })
        await friend.save()
        await otherFriend.save()
        await chat.save()
        await otherChat.save()
        res.json({ message: `You have blocked ${otherUserName}` })
    } catch (err) {
        next(err)
    }
}

const unBlock = async () => {
    const { userName } = req.user
    const { userName: otherUserName } = req.body

    try {
        if (!otherUserName) {
            return res.status(400).json({ message: "Username not provided" })
        }
        const friend = await Friend.findOne({ userName })
        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        const friendIndex = friend.blocked.findIndex(i => i.userName = otherUserName)
        friend.blocked.splice(friendIndex, 1)
        await friend.save()
        res.json({ message: `You have unblocked ${otherUserName}` })
    } catch (err) {
        next(err)
    }
}

const online = async (req, res, next) => {
    const { userName } = req.user
    try {
        const friend = await Friend.findOne({ userName })
        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        const { friends } = friend
        const search = friends.map(f => f.userName)
        const user = await User.find({ userName: { $in: search } })
        const online = friends.filter(f => user.find(u => u.userName === f.userName).online)
        res.json({ online })
    } catch (err) {
        next(err)
    }
}

const blocked = async (req, res, next) => {
    const { userName } = req.user
    try {
        const friend = await Friend.findOne({ userName })
        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        res.json({ pending: friend.blocked })
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
    cancelPendingRequest,
    block,
    unBlock,
    online,
    blocked
}