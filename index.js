const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const http = require('http')
const { Server } = require('socket.io')
const Message = require('./models/message')

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
    console.log(`New user joined - ${socket.id}`)

    socket.on('login', userName => socket.join(userName))
    socket.on('join_chatroom', chatId => socket.join(chatId))

    socket.on('send_message', async ({ chatId, userName, message }) => {
        try {
            const messageCollection = await Message.findOne({ chatId })
            messageCollection.messages.push({ userName, message })
            await messageCollection.save()
            socket.to(chatId).emit('receive_message', { chatId, userName, message })
        } catch (err) {
            console.log(err)
        }
    })
    socket.on('friend_request_sent', ({ userName }) => socket.to(userName).emit('friend_request_sent'))
    socket.on('friend_request_accepted', ({ userName }) => socket.to(userName).emit('friend_request_accepted'))
    socket.on('friend_request_rejected', ({ userName }) => socket.to(userName).emit('friend_request_rejected'))

    socket.on('email_verified', ({ room }) => socket.to(room).emit('email_verified'))
    socket.on('logout', ({ room, sessionId }) => socket.to(room).emit('logout', sessionId))
    socket.on('logoutAll', ({ room }) => socket.to(room).emit('logoutAll'))
    socket.on('disconnect', () => console.log(`User disconnected - ${socket.id}`))
})

app.use(errorHandler)

function errorHandler(err, req, res, next) {
    res.status(500).json({ message: 'An error occured, try again', error: err })
}

server.listen(port, () => console.log(`Listening at port ${port}`))