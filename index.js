const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')

const app = express()
const port = 3010

const userSchema = require('./models/user')
var User = mongoose.model('User', userSchema)

mongoose.connect('mongodb+srv://arjunkv:arjunkv_login@cluster0.en5phnp.mongodb.net/chat-app?retryWrites=true&w=majority')
const db = mongoose.connection;
db.on("error", () => console.log("connection error"));
db.once("open", () => app.listen(port, () => console.log(`Listening at port ${port}`)));

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3001',
}))

app.get('/', (req, res) => {
    res.json({ data: "home" })
})

app.get('/check_username/:username', (req, res) => {
    const { username } = req.params
    User.find({ userName: username }, (err, docs) => {
        if (err) res.json({ status: "Couldn't connect database" })
        else {
            if (docs.length === 0) res.json({ status: "Username is available" })
            else res.json({ status: "Username is not available" })
        }
    })
})

app.get('/check_email/:email', (req, res) => {
    const { email } = req.params
    User.find({ email }, (err, docs) => {
        if (err) res.json({ status: "Couldn't connect database" })
        else {
            if (docs.length === 0) res.json({ status: "Email is available" })
            else res.json({ status: "Email is not available" })
        }
    })
})

app.post('/register', (req, res) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
        const user = new User({
            ...req.body,
            password: hash
        })
        user.save(e => {
            if (e) {
                res.send({ message: "Couldn't signup new user" })
            } else {
                res.send({ message: "New user signed up" })
            }
        })
    })
})

app.post('/login', (req, res) => {
    const { email, password } = req.body
    User.find({ email }, (err, docs) => {
        if (err) res.json({ status: "Couldn't connect database" })
        else {
            if (docs.length === 0) res.json({ status: "User doesn't exist" })
            else {
                bcrypt.compare(password, docs[0].password, function (err, result) {
                    if (result === true) {
                        res.json({ status: "Logging in" })
                    } else {
                        res.json({ status: "Wrong password" })
                    }
                })
            }
        }
    })
})