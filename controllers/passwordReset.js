const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {
    getPasswordResetToken
} = require('../getTokens')
const transporter = require('../nodemailer')

const isExpired = async (req, res, next) => {
    const { passwordresettoken } = req.params
    try {
        const payload = jwt.verify(passwordresettoken, process.env.PASSWORD_RESET_TOKEN_SECRET)
        const userId = payload.sub
        const user = await User.findOne({ _id: userId })
        if (user === null) {
            return res.status(410).json({ isexpired: true, message: "User doesn't exist" })
        }
        if (user.passwordResetToken !== passwordresettoken) {
            return res.status(410).json({ isexpired: true, message: "Password reset link is expired" })
        }
        res.json({ isexpired: false, message: "Password reset link is valid" })
    } catch (err) {
        next(err)
    }
}

const sendMail = async (req, res, next) => {
    const { email } = req.params

    try {
        const user = await User.findOne({ email })
        if (user === null) {
            return res.status(410).json({ success: false, message: "User doesn't exist" })
        }
        const passwordResetToken = getPasswordResetToken(user._id)
        user.passwordResetToken = passwordResetToken

        const html = `
            <p>
                You can reset your password using this 
                <a 
                    href='http://localhost:3000/password-reset/${passwordResetToken}' 
                    target='_blank'
                >
                    link
                </a>
            </p>
        `
        const mailOptions = {
            from: process.env.HOST_MAIL_USER,
            to: user.email,
            subject: 'Password reset',
            html
        }
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                return next(err)
            } else {
                console.log('Email sent (password reset): ' + data.response)
            }
        })

        const saveUser = await user.save()
        res.json({ success: true, message: "Password reset link has been sent to your mail" })
    } catch (err) {
        next(err)
    }
}

const passwordReset = async (req, res, next) => {
    const { passwordResetToken, password } = req.body
    try {
        const payload = jwt.verify(passwordResetToken, process.env.PASSWORD_RESET_TOKEN_SECRET)
        const userId = payload.sub
        const user = await User.findOne({ _id: userId })
        if (user === null) {
            return res.status(410).json({ success: false, message: "User doesn't exist" })
        }
        if (user.passwordResetToken !== passwordResetToken) {
            return res.status(410).json({ success: false, message: "This link is expired" })
        }
        const result = await bcrypt.compare(password, user.password)
        if (result === true) {
            return res.status(400).json({ success: false, message: "You can't use the old password" })
        }
        user.passwordResetToken = ''
        const hash = await bcrypt.hash(req.body.password, 10)
        user.password = hash
        const saveUser = await user.save()
        res.json({ success: true, message: "Your password has been reset successfully" })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    isExpired,
    sendMail,
    passwordReset
}