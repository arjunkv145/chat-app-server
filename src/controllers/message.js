const Message = require('../models/message')
const Chat = require('../models/chat')
const User = require('../models/user')
const Privacy = require('../models/privacy')
const Friend = require('../models/friend')

const messages = async (req, res, next) => {
    const { chatId } = req.params

    try {
        const messageCollection = await Message.findOne({ chatId })
        if (messageCollection === null) {
            return res.status(404).json({ message: 'Not found' })
        }
        res.json({ message: messageCollection })
    } catch (err) {
        next(err)
    }
}

const message = async (req, res, next) => {
    const { chatId } = req.params
    const { userName } = req.user

    try {
        const messageCollection = await Message.findOne({ chatId })
        if (messageCollection === null) {
            return res.status(404).json({ message: 'Not found' })
        }
        const chatCollection = await Chat.findOne({ chatId })
        if (chatCollection.chatType === 'DM') {
            const index = chatCollection.members.findIndex(
                (u) => u.userName === userName
            )
            chatCollection.members.splice(index, 1)
            const targetUserName = chatCollection.members[0]
            const user = await User.findOne({
                userName: targetUserName
            })
            if (user.blockedUsers.includes(userName) === true) {
                return res.status(403).json({ message: 'Cannot send message' })
            }
            const privacyCollection = await Privacy.findOne({
                userName: targetUserName
            })
            if (privacyCollection.acceptMessageFrom === 'My friends') {
                const friendCollection = await Friend.findOne({
                    $or: [
                        {
                            $and: [
                                { requestFrom: 'nimal' },
                                { requestTo: 'arjun' }
                            ]
                        },
                        {
                            $and: [
                                { requestFrom: 'arjun' },
                                { requestTo: 'nimal' }
                            ]
                        }
                    ]
                })
                if (
                    friendCollection === null ||
                    friendCollection.pending === true
                ) {
                    return res
                        .status(403)
                        .json({ message: 'Cannot send message' })
                }
            }
        }

        messageCollection.push({ userName, message })
        await messageCollection.save()

        const chat = await Chat.findOne({ chatId })
        chat.totalMessageCount += 1
        await chat.save()

        res.json({ message: 'Message sent!' })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    messages,
    message
}
