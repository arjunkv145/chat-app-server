const User = require('../models/user')
const Friend = require('../models/friend')

const sendRequest = async (req, res, next) => {
    const { userName } = req.user
    const { userName: targetUserName } = req.body

    try {
        if (!targetUserName) {
            return res.status(400).json({ message: 'Username not provided' })
        }
        if (userName === targetUserName) {
            return res.status(422).json({
                message: 'Request not sent. Recheck your spelling and try again'
            })
        }
        const user = await User.findOne({ userName: targetUserName })
        if (user === null) {
            return res.status(422).json({
                message: 'Request not sent. Recheck your spelling and try again'
            })
        }
        const check1 = await Friend.findOne({
            $and: [{ requestFrom: userName }, { requestTo: targetUserName }]
        })
        const check2 = await Friend.findOne({
            $and: [{ requestFrom: targetUserName }, { requestTo: userName }]
        })
        if (check1 !== null && check1.pending === true) {
            return res.status(422).json({ message: 'Request already sent' })
        } else if (check1 !== null && check1.pending === false) {
            return res.status(422).json({ message: 'Already friends' })
        } else if (check2 !== null && check2.pending === true) {
            return res.status(422).json({
                message: 'This user has already sent you a request'
            })
        } else if (check2 !== null && check2.pending === false) {
            return res.status(422).json({ message: 'Already friends' })
        }
        const newRequest = new Friend({
            reuqestFrom: userName,
            requestTo: targetUserName
        })
        await newRequest.save()
        return res.json({ message: 'Request sent successfully!' })
    } catch (err) {
        next(err)
    }
}

const pendingRequest = async (req, res, next) => {
    const { userName } = req.user
    try {
        const pendingRequest = await Friend.find({
            $and: [{ requestFrom: userName }, { pending: true }]
        })
        res.json({ pendingRequest })
    } catch (err) {
        next(err)
    }
}

const cancelRequest = async (req, res, next) => {
    const { userName } = req.user
    const { userName: targetUserName } = req.body

    try {
        const check1 = await Friend.deleteOne({
            $and: [
                { requestFrom: targetUserName },
                { requestTo: userName },
                { pending: true }
            ]
        })
        const check2 = await Friend.deleteOne({
            $and: [
                { requestFrom: userName },
                { requestTo: targetUserName },
                { pending: true }
            ]
        })
        if (check1.ok === 1 || check2.ok === 1) {
            return res.json({ message: 'Request has been canceled!' })
        } else {
            return res
                .status(422)
                .json({ message: 'Cannot process the request' })
        }
    } catch (err) {
        next(err)
    }
}

const requests = async (req, res, next) => {
    const { userName } = req.user
    try {
        const requests = await Friend.find({
            $and: [{ requestTo: userName }, { pending: true }]
        })
        res.json({ requests })
    } catch (err) {
        next(err)
    }
}

const accept = async (req, res, next) => {
    const { userName } = req.user
    const { userName: targetUserName } = req.body

    try {
        const friend = await Friend.findOne({
            $and: [
                { requestFrom: targetUserName },
                { requestTo: userName },
                { pending: true }
            ]
        })
        if (friend === null) {
            return res
                .status(422)
                .json({ message: 'Cannot process the request' })
        }
        friend.pending = false
        await friend.save()
        res.json({ message: 'Request has been accepted!' })
    } catch (err) {
        next(err)
    }
}

const reject = async (req, res, next) => {
    const { userName } = req.user
    const { userName: targetUserName } = req.body

    try {
        const result = await Friend.deleteOne({
            $and: [
                { requestFrom: targetUserName },
                { requestTo: userName },
                { pending: true }
            ]
        })
        if (result.ok === 1) {
            return res.json({ message: 'Request has been accepted!' })
        } else {
            return res
                .status(422)
                .json({ message: 'Cannot process the request' })
        }
    } catch (err) {
        next(err)
    }
}

const friends = async (req, res, next) => {
    const { userName } = req.user
    try {
        const friends1 = await Friend.find({
            $and: [{ requestFrom: userName }, { pending: false }]
        })
        const friends2 = await Friend.find({
            $and: [{ requestTo: userName }, { pending: false }]
        })
        res.json({ friends: [...friends1, ...friends2] })
    } catch (err) {
        next(err)
    }
}

const unfriend = async (req, res, next) => {
    const { userName } = req.user
    const { userName: targetUserName } = req.body

    try {
        const check1 = await Friend.deleteOne({
            $and: [
                { requestFrom: targetUserName },
                { requestTo: userName },
                { pending: false }
            ]
        })
        const check2 = await Friend.deleteOne({
            $and: [
                { requestFrom: userName },
                { requestTo: targetUserName },
                { pending: false }
            ]
        })
        if (check1.ok === 1 || check2.ok === 1) {
            return res.json({ message: 'Request has been accepted!' })
        } else {
            return res
                .status(422)
                .json({ message: 'Cannot process the request' })
        }
    } catch (err) {
        next(err)
    }
}

const block = async (req, res, next) => {
    const { userName } = req.user
    const { userName: targetUserName } = req.body

    try {
        const check1 = await Friend.findOne({
            $and: [{ requestFrom: targetUserName }, { requestTo: userName }]
        })
        const check2 = await Friend.findOne({
            $and: [{ requestFrom: userName }, { requestTo: targetUserName }]
        })
        if (check1 !== null) {
            await Friend.deleteOne({
                $and: [{ requestFrom: targetUserName }, { requestTo: userName }]
            })
        }
        if (check2 !== null) {
            await Friend.deleteOne({
                $and: [{ requestFrom: userName }, { requestTo: targetUserName }]
            })
        }
        const user = await User.findOne({ userName })
        user.blockedUsers.push({ userName: targetUserName })
        await user.save()
        res.json({ message: 'This user has been blocked!' })
    } catch (err) {
        next(err)
    }
}

const unBlock = async (req, res, next) => {
    const { userName } = req.user
    const { userName: targetUserName } = req.body

    try {
        const user = await User.findOne({ userName })
        const index = user.blockedUsers.findIndex(
            (u) => u.userName === targetUserName
        )
        user.blockedUsers.splice(index, 1)
        await user.save()
        res.json({ message: 'This user has been unblocked!' })
    } catch (err) {
        next(err)
    }
}

const blocked = async (req, res, next) => {
    const { userName } = req.user
    try {
        const user = await User.findOne({ userName })
        res.json({ blockedUsers: user.blockedUsers })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    sendRequest,
    pendingRequest,
    cancelRequest,
    requests,
    accept,
    reject,
    friends,
    unfriend,
    block,
    unBlock,
    blocked
}
