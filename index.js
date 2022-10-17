const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')

require('dotenv').config()
const { getAccessToken, getRefreshToken } = require('./getTokens')
const verifyUser = require('./verifyUser')

const app = express()
const port = process.env.PORT
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,
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

app.get('/api/isauthenticated', verifyUser, (req, res) => {
    res.json({ success: true, user: req.user })
})

app.post('/refreshtoken', (req, res) => {
    res.json({})
})

app.post('/api/register', (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                ...req.body,
                password: hash
            })
            const accessToken = getAccessToken(user._id)
            const refreshToken = getRefreshToken(user._id)
            user.refreshToken.push({ refreshToken })
            user.save()
                .then(saveUser => {
                    delete saveUser.password
                    delete saveUser.refreshToken
                    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
                    res.send({
                        success: true,
                        user: saveUser,
                        accessToken: accessToken
                    })
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
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
        user.refreshToken.push({ refreshToken })
        const saveUser = await user.save()
        delete saveUser.password
        delete saveUser.refreshToken
        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        res.send({
            success: true,
            user: saveUser,
            accessToken: accessToken
        })
    } catch (err) {
        next(err)
    }
})

app.get('/api/logout', (req, res, next) => {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies

    User.findById(req.user._id)
        .then(user => {
            const tokenIndex = user.refreshToken.findIndex(i => i.refreshToken === refreshToken)
            if (tokenIndex !== -1) {
                user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove()
            }
            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500
                    next(err)
                } else {
                    res.clearCookie("refreshToken", COOKIE_OPTIONS)
                    res.send({ success: true, message: "You are now logged out" })
                }
            })
        })
        .catch(err => next(err))
})

app.get('/api/check_username/:username', (req, res, next) => {
    const { username } = req.params
    User.find({ userName }, (err, docs) => {
        if (err) next()
        else {
            if (docs.length === 0) res.json({ success: true, message: "Username is available" })
            else res.json({ success: false, message: "Username is not available" })
        }
    })
})

app.get('/api/check_email/:email', (req, res, next) => {
    const { email } = req.params
    User.find({ email }, (err, docs) => {
        if (err) next()
        else {
            if (docs.length === 0) res.json({ success: true, message: "Email is available" })
            else res.json({ success: false, message: "Email is not available" })
        }
    })
})

app.use(errorHandler)

function errorHandler(err, req, res, next) {
    res.json({ error: "An error occured, try again" })
}

app.listen(port, () => console.log(`Listening at port ${port}`))