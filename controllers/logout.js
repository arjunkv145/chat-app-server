const User = require('../models/user')
const jwt = require('jsonwebtoken')
const COOKIE_OPTIONS = require('../options').COOKIE_OPTIONS

const logout = async (req, res, next) => {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const userId = payload.sub

        const user = await User.findById(userId)
        if (user === null) {
            throw new Error("Can't find user in database")
        }
        const tokenIndex = user.refreshToken.findIndex(i => i.refreshToken === refreshToken)
        if (tokenIndex !== -1) {
            user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove()
        } else {
            throw new Error("Can't find token in database")
        }
        const saveUser = await user.save()
        res.clearCookie('refreshToken', COOKIE_OPTIONS)
        res.json({ message: "You are now logged out" })
    } catch (err) {
        next(err)
    }
}

const logoutAll = async (req, res, next) => {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const userId = payload.sub

        const user = await User.findById(userId)
        if (user === null) {
            throw new Error("Can't find user in database")
        }
        user.refreshToken = []
        await user.save()
        res.clearCookie('refreshToken', COOKIE_OPTIONS)
        res.json({ message: "You are now logged out of all devices" })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    logout,
    logoutAll
}