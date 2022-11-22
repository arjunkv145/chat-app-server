const User = require('../models/user')
const bcrypt = require('bcrypt')
const {
    getAccessToken,
    getRefreshToken
} = require('../getTokens')
const COOKIE_OPTIONS = require('../options').COOKIE_OPTIONS

const login = async (req, res, next) => {
    const { userNameOrEmail, password } = req.body
    try {
        const user = await User.findOne({
            $or: [
                { userName: userNameOrEmail },
                { email: userNameOrEmail }
            ]
        })
        if (user === null) {
            return res.status(401).json({ success: false, message: "User doesn't exist" })
        }
        const result = await bcrypt.compare(password, user.password)
        if (result === false) {
            return res.status(401).json({ success: false, message: "Wrong password" })
        }
        const accessToken = getAccessToken(user._id)
        const refreshToken = getRefreshToken(user._id)
        const sessionId = user.refreshToken.length + 1
        user.refreshToken.push({ sessionId, refreshToken })
        const saveUser = await user.save()
        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        res.json({
            success: true,
            user: {
                userName: saveUser.userName,
                email: saveUser.email,
                emailVerified: saveUser.emailVerified
            },
            accessToken,
            sessionId
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    login,
}