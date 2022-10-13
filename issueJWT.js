const jwt = require('jsonwebtoken')

module.exports = user => {
    const _id = user._id

    const payload = { sub: _id }
    const JWT_secretKey = process.env.JWT_SECRET
    const expiresIn = '1h'

    const signedToken = jwt.sign(payload, JWT_secretKey, { expiresIn })

    return { token: `Bearer ${signedToken}`, expiresIn }
}