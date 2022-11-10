const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const http = require('http')
const { Server } = require('socket.io')

require('dotenv').config()

const CORS_OPTIONS = require('./options').CORS_OPTIONS
const app = express()
const server = http.createServer(app).listen(3031)
const io = new Server(server, {
    cors: CORS_OPTIONS
})

const port = process.env.PORT

require('./dbConnect')

const signupRoutes = require('./routes/signup')
const loginRoutes = require('./routes/login')
const logoutRoutes = require('./routes/logout')
const passwordResetRoutes = require('./routes/passwordReset')
const groupRoutes = require('./routes/group')
const userRoutes = require('./routes/user')

app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(express.json())
app.use(cors(CORS_OPTIONS))

app.use('/api/signup', signupRoutes)
app.use('/api/login', loginRoutes)
app.use('/api/logout', logoutRoutes)
app.use('/api/passwordreset', passwordResetRoutes)
app.use('/api/group', groupRoutes)
app.use('/api/user', userRoutes)

app.get('/api/userslist', (req, res) => {
    const usersList = [
        { id: 1, userName: "chatroom" },
    ]

    res.json({ usersList })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    const usersList = [
        { id: 1, userName: "chatroom" },
    ]
    const user = usersList.find(u => u.id == userId)

    res.json({ user })
})

io.on('connection', socket => {
    console.log(`new user joined - ${socket.id}`)
    socket.on('send_message', data => {
        socket.broadcast.emit('receive_message', data)
    })
})

app.use(errorHandler)

function errorHandler(err, req, res, next) {
    res.status(500).json({ message: "An error occured, try again", error: err })
}

app.listen(port, () => console.log(`Listening at port ${port}`))