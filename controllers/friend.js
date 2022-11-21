const User = require('../models/user')
const Friend = require('../models/friend')
const Chat = require('../models/chat')

const request = async (req, res, next) => {
    const { userName } = req.body
    const myUserName = req.user.userName

    try {
        if (!userName) {
            return res.status(400).json({ message: "Username not provided" })
        }
        if (myUserName === userName) {
            return res.status(422).json({ message: "Can't send request" })
        }
        const user = await User.findOne({ userName })
        if (user === null) {
            return res.status(404).json({ message: "User doesn't exist" })
        }

        const myFriend = await Friend.findOne({ userName: myUserName })
        if (myFriend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        if (myFriend.friends.find(friend => friend.userName === userName) !== undefined) {
            return res.status(422).json({ message: "Already friends" })
        }
        if (myFriend.pendingRequest.find(request => request.userName === userName) !== undefined) {
            return res.status(422).json({ message: "Already sent request" })
        }

        const myChat = await Chat.findOne({ userName: myUserName })
        if (myChat === null) {
            return next({ error: "Failed to create chat collections" })
        }
        if (myChat.chats.find(chat => chat.userName === userName) !== undefined) {
            return res.status(422).json({ message: "This user has already sent you a request" })
        }

        const { nanoid } = await import('nanoid')
        const chatId = nanoid()
        const chat = await Chat.findOne({ userName })
        if (chat === null) {
            return next({ error: "Failed to create chat collections for the user you are sending request" })
        }

        myFriend.pendingRequest.unshift({ userName })
        await myFriend.save()
        chat.chats.unshift({ userName: myUserName, chatId })
        await chat.save()

        res.json({ message: 'Request sent successfully' })
    } catch (err) {
        next(err)
    }
}

const pending = async (req, res, next) => {
    try {
        const friend = await Friend.findOne({ userName: req.user.userName })
        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        res.json({
            success: true,
            pendingRequest: friend.pendingRequest
        })
    } catch (err) {
        next(err)
    }
}

const friends = async (req, res, next) => {
    try {
        const friend = await Friend.findOne({ userName: req.user.userName })
        if (friend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        res.json({
            success: true,
            friends: friend.friends
        })
    } catch (err) {
        next(err)
    }
}

const accept = async (req, res, next) => {
    const { userName, chatId } = req.body
    const myUserName = req.user.userName

    try {
        if (!userName) {
            return res.status(400).json({ success: false, message: "Username not provided" })
        }

        const myFriend = await Friend.findOne({ userName: myUserName })
        if (myFriend === null) {
            return next({ error: "Failed to create friend collections" })
        }
        const friend = await Friend.findOne({ userName })
        if (friend === null) {
            return next({ error: "Failed to create friend collections for the user you are sending request" })
        }

        const myChat = await Chat.findOne({ userName: myUserName })
        if (myChat === null) {
            return res.json({ success: false, message: "Failed to create chat collections" })
        }
        const chat = await Chat.findOne({ userName })
        if (chat === null) {
            return res.json({ success: false, message: "Failed to create chat collections for the user you are sending request" })
        }

        const myChatIndex = myChat.chats.findIndex(i => i.userName === userName)

        myChat.chats[myChatIndex] = {
            userName,
            chatId,
            friends: true,
            pending: false,
            requestSent: false
        }
        chat.chats.unshift({
            userName: myUserName,
            chatId,
            friends: true,
            pending: false,
            requestSent: false
        })

        pendingRequestIndex = friend.pendingRequest.findIndex(i => i.userName = myUserName)
        friend.pendingRequest.splice(pendingRequestIndex, 1)

        myFriend.friends.unshift({ userName })
        friend.friends.unshift({ userName: myUserName })
        await myFriend.save()
        await friend.save()
        await myChat.save()
        await chat.save()

        res.json({
            success: true,
            message: 'You are now friends'
        })
    } catch (err) {
        next(err)
    }
}

const reject = async (req, res, next) => {
    const { userName } = req.body
    const myUserName = req.user.userName

    try {
        if (!userName) {
            return res.status(400).json({ success: false, message: "Username not provided" })
        }

        const friend = await Friend.findOne({ userName })
        if (friend === null) {
            return next({ error: "Failed to create friend collections for the user you are sending request" })
        }

        const myChat = await Chat.findOne({ userName: myUserName })
        if (myChat === null) {
            return res.json({ success: false, message: "Failed to create chat collections" })
        }

        const myChatIndex = myChat.chats.findIndex(i => i.userName === userName)

        myChat.chats.splice(myChatIndex, 1)

        pendingRequestIndex = friend.pendingRequest.findIndex(i => i.userName = myUserName)
        friend.pendingRequest.splice(pendingRequestIndex, 1)

        await friend.save()
        await myChat.save()

        res.json({
            success: true,
            message: 'You are rejected the friend request'
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    request,
    pending,
    friends,
    accept,
    reject
}