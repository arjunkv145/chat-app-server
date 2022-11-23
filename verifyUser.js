const jsonwebtoken = require('jsonwebtoken')
const User = require('./models/user')

module.exports = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            throw new Error("You don't have an access token")
        }
        const tokenParts = req.headers.authorization.split(' ')
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            throw new Error("Invalid access token")
        }
        const payload = jsonwebtoken.verify(tokenParts[1], process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findOne({ _id: payload.sub })
        if (user === null) {
            throw new Error("User doesn't exist in database")
        }
        req.user = user
        next()
    } catch (err) {
        res.status(403).json({ message: err })
    }
}