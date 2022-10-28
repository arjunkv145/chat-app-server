const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

require('dotenv').config()

const app = express()
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
app.use(cors(require('./options').CORS_OPTIONS))

app.use('/api/signup', signupRoutes)
app.use('/api/login', loginRoutes)
app.use('/api/logout', logoutRoutes)
app.use('/api/passwordreset', passwordResetRoutes)
app.use('/api/group', groupRoutes)
app.use('/api/user', userRoutes)

app.use(errorHandler)

function errorHandler(err, req, res, next) {
    res.status(500).json({ message: "An error occured, try again", error: err })
}

app.listen(port, () => console.log(`Listening at port ${port}`))