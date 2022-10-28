const User = require('../models/user')
const bcrypt = require('bcrypt')
const {
    getAccessToken,
    getRefreshToken
} = require('../getTokens')
const COOKIE_OPTIONS = require('../options').COOKIE_OPTIONS

const login = async (req, res, next) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (user === null) {
            return res.json({ success: false, message: "User doesn't exist" })
        }
        const result = await bcrypt.compare(password, user.password)
        if (result === false) {
            return res.json({ success: false, message: "Wrong password" })
        }
        const accessToken = getAccessToken(user._id)
        const refreshToken = getRefreshToken(user._id)
        user.refreshToken = user.refreshToken.filter(token => {
            try {
                const payload = jsonwebtoken.verify(token.refreshToken, process.env.REFRESH_TOKEN_SECRET)
                return true
            } catch (err) {
                return false
            }
        })
        user.refreshToken.push({ refreshToken })
        const saveUser = await user.save()
        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        res.json({
            success: true,
            user: {
                userName: saveUser.userName,
                email: saveUser.email,
                emailVerified: saveUser.emailVerified
            },
            accessToken: accessToken
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    login,
}