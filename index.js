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
        { id: 1, userName: "user1" },
        { id: 2, userName: "user2" },
        { id: 3, userName: "user3" },
        { id: 4, userName: "user4" },
        { id: 5, userName: "user5" },
        { id: 6, userName: "user6" },
        { id: 7, userName: "user7" },
        // { id: 8, userName: "user8" },
        // { id: 9, userName: "user9" },
        // { id: 10, userName: "user10" },
        // { id: 11, userName: "user11" },
        // { id: 12, userName: "user12" },
        // { id: 13, userName: "user13" },
        // { id: 14, userName: "user14" },
        // { id: 15, userName: "user15" },
        // { id: 16, userName: "user16" },
        // { id: 17, userName: "user17" },
        // { id: 18, userName: "user18" },
        // { id: 19, userName: "user19" },
        // { id: 20, userName: "user20" },
        // { id: 21, userName: "user21" },
        // { id: 22, userName: "user22" },
        // { id: 23, userName: "user23" },
    ]

    res.json({ usersList })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    const usersList = [
        { id: 1, userName: "user1" },
        { id: 2, userName: "user2" },
        { id: 3, userName: "user3" },
        { id: 4, userName: "user4" },
        { id: 5, userName: "user5" },
        { id: 6, userName: "user6" },
        { id: 7, userName: "user7" },
        { id: 8, userName: "user8" },
        { id: 9, userName: "user9" },
        { id: 10, userName: "user10" },
        { id: 11, userName: "user11" },
        { id: 12, userName: "user12" },
        { id: 13, userName: "user13" },
        { id: 14, userName: "user14" },
        { id: 15, userName: "user15" },
        { id: 16, userName: "user16" },
        { id: 17, userName: "user17" },
        { id: 18, userName: "user18" },
        { id: 19, userName: "user19" },
        { id: 20, userName: "user20" },
        { id: 21, userName: "user21" },
        { id: 22, userName: "user22" },
        { id: 23, userName: "user23" },
    ]
    const user = usersList.find(u => u.id == userId)

    res.json({ user })
})

io.on('connection', socket => {
    console.log(`new user joined - ${socket.id}`)
})

app.use(errorHandler)

function errorHandler(err, req, res, next) {
    res.status(500).json({ message: "An error occured, try again", error: err })
}

app.listen(port, () => console.log(`Listening at port ${port}`))