const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

require('dotenv').config()
const { getAccessToken, getRefreshToken } = require('./getTokens')
const verifyUser = require('./verifyUser')

const app = express()
const port = process.env.PORT
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    signed: true,
    maxAge: eval(process.env.REFRESH_TOKEN_EXPIRATION) * 1000,
    sameSite: "none",
}

const User = require('./models/user')

mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING)
const db = mongoose.connection;
db.on("error", () => console.log("connection error"));
db.once("open", () => console.log("Database has connected"));

app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(express.json())
app.use(cors({
    origin: process.env.WHITELISTED_DOMAIN,
    credentials: true
}))

app.get('/api/groups', verifyUser, (req, res) => {
    res.json({ groups: ['art', 'music', 'anime', 'gaming', 'sports', 'writing', 'manga'] })
})

app.get('/api/', async (req, res, next) => {
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
            user: { userName: saveUser.userName, email: saveUser.email },
            accessToken: newAccessToken
        })
    } catch (err) {
        res.status(403).json({ success: false, message: err })
    }
})

app.post('/api/register', async (req, res, next) => {

    try {
        const hash = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            ...req.body,
            password: hash
        })
        const accessToken = getAccessToken(user._id)
        const refreshToken = getRefreshToken(user._id)
        user.refreshToken.push({ refreshToken })
        const saveUser = await user.save()
        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        res.json({
            success: true,
            user: { userName: saveUser.userName, email: saveUser.email },
            accessToken: accessToken
        })
    } catch (err) {
        next(err)
    }
})

app.post('/api/login', async (req, res, next) => {
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
            user: { userName: saveUser.userName, email: saveUser.email },
            accessToken: accessToken
        })
    } catch (err) {
        next(err)
    }
})

app.get('/api/logout', async (req, res, next) => {
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
        res.clearCookie("refreshToken", COOKIE_OPTIONS)
        res.json({ success: true, message: "You are now logged out" })
    } catch (err) {
        next(err)
    }
})

app.get('/api/check_username/:userName', async (req, res, next) => {
    const { userName } = req.params
    try {
        const user = await User.findOne({ userName })
        if (user === null) {
            res.json({ success: true, message: "Username is available" })
        }
        else {
            res.json({ success: false, message: "Username is not available" })
        }
    } catch (err) {
        next(err)
    }
})

app.get('/api/check_email/:email', async (req, res, next) => {
    const { email } = req.params
    try {
        const user = await User.findOne({ email })
        if (user === null) {
            res.json({ success: true, message: "Email is available" })
        }
        else {
            res.json({ success: false, message: "Email is not available" })
        }
    } catch (err) {
        next(err)
    }
})

app.use(errorHandler)

function errorHandler(err, req, res, next) {
    res.status(500).json({ message: "An error occured, try again", error: err })
}

app.listen(port, () => console.log(`Listening at port ${port}`))