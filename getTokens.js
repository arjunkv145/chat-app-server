const jwt = require('jsonwebtoken')

const getAccessToken = userId => {

    const payload = { sub: userId }
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRATION

    const accessToken = jwt.sign(payload, access_token_secret, { expiresIn })

    return accessToken
}

const getRefreshToken = userId => {

    const payload = { sub: userId }
    const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRATION

    const refreshToken = jwt.sign(payload, refresh_token_secret, { expiresIn })

    return refreshToken
}

module.exports = { getAccessToken, getRefreshToken }