const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const http = require('http')
const { Server } = require('socket.io')

require('dotenv').config()

const CORS_OPTIONS = require('./options').CORS_OPTIONS
const app = express()
const server = http.createServer(app)
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
const chatRoutes = require('./routes/chat')
const friendRoutes = require('./routes/friend')

app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(express.json())
app.use(cors(CORS_OPTIONS))

app.use('/api/signup', signupRoutes)
app.use('/api/login', loginRoutes)
app.use('/api/logout', logoutRoutes)
app.use('/api/password-reset', passwordResetRoutes)
app.use('/api/group', groupRoutes)
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/friend', friendRoutes)

io.on('connection', socket => {
    console.log(`new user joined - ${socket.id}`)
    socket.join(socket.handshake.query.userName)
    socket.on('join_room', userName => {
        socket.join(userName)
    })
    socket.on('send_message', data => {
        socket.broadcast.emit('receive_message', data)
    })
    socket.on('email is verified', data => {
        socket.to(data.room).emit('email is verified')
    })
    socket.on('logout', data => {
        socket.to(data.room).emit('logout', data.sessionId)
    })
    socket.on('logoutAll', data => {
        socket.to(data.room).emit('logoutAll')
    })
    socket.on('disconnect', data => {
        console.log(`user disconnected - ${socket.id}`)
    })
})

app.use(errorHandler)

function errorHandler(err, req, res, next) {
    res.status(500).json({ message: 'An error occured, try again', error: err })
}

server.listen(port, () => console.log(`Listening at port ${port}`))