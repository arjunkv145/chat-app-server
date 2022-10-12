const jsonwebtoken = require('jsonwebtoken')

module.exports = user => {
    const _id = user._id
    const expiresIn = '14d'

    const payload = {
        sub: _id,
        iat: Date.now()
    }

    const signedToken = jsonwebtoken.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: expiresIn }
    )

    return {
        token: `Bearer ${signedToken}`,
        expires: expiresIn
    }
}