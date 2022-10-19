const jsonwebtoken = require('jsonwebtoken')
const User = require('./models/user')

module.exports = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            throw "You don't have an access token"
        }
        const tokenParts = req.headers.authorization.split(' ')
        if (tokenParts[0] = 'Bearer' && tokenParts[1].match(/\S+\.\S+\.\S+/) !== null && tokenParts.length === 2) {
            throw "Invalid access token"
        }
        const payload = await jsonwebtoken.verify(tokenParts[1], process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findOne({ _id: payload.sub })
        if (user === null) {
            throw "User doesn't exist in database"
        }
        req.user = user
        next()
    } catch (err) {
        res.status(403).json({ success: false, message: err })
    }
}