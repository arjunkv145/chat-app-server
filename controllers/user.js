const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {
    getAccessToken,
    getRefreshToken
} = require('../getTokens')
const COOKIE_OPTIONS = require('../options').COOKIE_OPTIONS

const refreshToken = async (req, res, next) => {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies

    try {
        if (!refreshToken) {
            throw "You don't have a token"
        }
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const userId = payload.sub
        const user = await User.findOne({ _id: userId })
        if (user === null) {
            throw "User doesn't exist in database"
        }
        const tokenIndex = user.refreshToken.findIndex(i => i.refreshToken === refreshToken)
        if (tokenIndex === -1) {
            throw "You are not authorized to access this resource"
        }
        const newAccessToken = getAccessToken(user._id)
        const newRefreshToken = getRefreshToken(user._id)
        user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken }
        const saveUser = await user.save()
        res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
        res.send({
            success: true,
            user: {
                userName: saveUser.userName,
                email: saveUser.email,
                emailVerified: saveUser.emailVerified
            },
            accessToken: newAccessToken
        })
    } catch (err) {
        res.status(401).json({ success: false, message: err })
    }
}

module.exports = {
    refreshToken
}