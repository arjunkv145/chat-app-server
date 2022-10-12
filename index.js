const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')

require('dotenv').config()
const issueJWT = require('./issueJWT')
const authMiddleware = require('./authMiddleware')

const app = express()
const port = process.env.PORT

const User = require('./models/user')

mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING)
const db = mongoose.connection;
db.on("error", () => console.log("connection error"));
db.once("open", () => console.log("Database has connected"));

app.use(express.json())
app.use(cors({ origin: process.env.WHITELISTED_DOMAIN }))

app.get('/', authMiddleware, (req, res) => {
    res.json({ user: req.user })
})

app.post('/register', (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
        const user = new User({
            ...req.body,
            password: hash
        })
        user.save()
            .then(user => {
                const id = user._id
                const jwt = issueJWT(user)
                res.send({
                    success: true,
                    user: user,
                    token: jwt.token,
                    expiresIn: jwt.expires
                })
            })
            .catch(err => next())
    })
})

app.post('/login', (req, res, next) => {
    const { email, password } = req.body
    User.find({ email }, (err, docs) => {
        if (err) next()
        else {
            if (docs.length === 0) res.json({ success: false, message: "User doesn't exist" })
            else {
                bcrypt.compare(password, docs[0].password, function (err, result) {
                    if (result === true) {
                        const user = docs[0]
                        const id = user._id
                        const jwt = issueJWT(user)
                        res.send({
                            success: true,
                            message: "Logging in",
                            user: user,
                            token: jwt.token,
                            expiresIn: jwt.expires
                        })
                    } else {
                        res.json({ success: false, message: "Wrong password" })
                    }
                })
            }
        }
    })
})

app.get('/check_username/:username', (req, res, next) => {
    const { username } = req.params
    User.find({ userName }, (err, docs) => {
        if (err) next()
        else {
            if (docs.length === 0) res.json({ success: true, message: "Username is available" })
            else res.json({ success: false, message: "Username is not available" })
        }
    })
})

app.get('/check_email/:email', (req, res, next) => {
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