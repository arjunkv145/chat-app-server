const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {
    getAccessToken,
    getRefreshToken,
    getEmailVerificationToken
} = require('../getTokens')
const transporter = require('../nodemailer')
const COOKIE_OPTIONS = require('../options').COOKIE_OPTIONS

const newuser = async (req, res, next) => {

    try {
        const hash = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            ...req.body,
            password: hash
        })
        const accessToken = getAccessToken(user._id)
        const refreshToken = getRefreshToken(user._id)
        const emailVerificationToken = getEmailVerificationToken(user._id)
        user.refreshToken.push({ refreshToken })
        user.emailVerificationToken = emailVerificationToken

        const html = `
            <p>
                Verifiy your email by clicking this 
                <a 
                    href='http://localhost:3030/api/signup/verifyyouremail/${emailVerificationToken}' 
                    target='_blank'
                >
                    link
                </a>
            </p>
        `
        const mailOptions = {
            from: process.env.HOST_MAIL_USER,
            to: user.email,
            subject: 'Verify your email',
            html
        }
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                return next(err)
            } else {
                console.log('Email sent (email verification): ' + data.response)
            }
        })

        const saveUser = await user.save()
        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        res.json({
            success: true,
            user: {
                userName: saveUser.userName,
                email: saveUser.email,
                emailVerified: saveUser.emailVerified
            },
            accessToken: accessToken
        })
    } catch (err) {
        next(err)
    }
}

const isusernameavailable = async (req, res, next) => {
    const { userName } = req.params
    try {
        const user = await User.findOne({ userName })
        if (user === null) {
            res.json({ success: true, message: "Username is available" })
        }
        else {
            res.json({ success: false, message: "This username is already taken" })
        }
    } catch (err) {
        next(err)
    }
}

const isemailavailable = async (req, res, next) => {
    const { email } = req.params
    try {
        const user = await User.findOne({ email })
        if (user === null) {
            res.json({ success: true, message: "Email is available" })
        }
        else {
            res.json({ success: false, message: "This email is already taken" })
        }
    } catch (err) {
        next(err)
    }
}

const resend = async (req, res, next) => {
    const { email } = req.params

    try {
        const user = await User.findOne({ email })
        if (user === null) {
            return res.json({ success: false, message: "User doesn't exist" })
        }
        const emailVerificationToken = getEmailVerificationToken(user._id)
        user.emailVerificationToken = emailVerificationToken

        const html = `
            <p>
                Verifiy your email by clicking this 
                <a 
                    href='http://localhost:3030/api/signup/verifyyouremail/${emailVerificationToken}' 
                    target='_blank'
                >
                    link
                </a>
            </p>
        `
        const mailOptions = {
            from: process.env.HOST_MAIL_USER,
            to: user.email,
            subject: 'Verify your email',
            html
        }
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                return next(err)
            } else {
                console.log('Email sent (email verification): ' + data.response)
            }
        })

        const saveUser = await user.save()
        res.json({ success: true, message: "New email verification link has been sent to your mail" })
    } catch (err) {
        next(err)
    }
}

const verifyyouremail = async (req, res, next) => {
    const { emailVerificationToken } = req.params
    try {
        const payload = jwt.verify(emailVerificationToken, process.env.EMAIL_VERIFICATION_TOKEN_SECRET)
        const userId = payload.sub
        const user = await User.findOne({ _id: userId })
        if (user === null) {
            return res.json({ success: false, message: "User doesn't exist" })
        }
        if (user.emailVerificationToken !== emailVerificationToken) {
            return res.json({ success: false, message: "This link is expired" })
        }
        user.emailVerified = true
        user.emailVerificationToken = ''
        const saveUser = await user.save()
        res.redirect('//localhost:3000/chat')
    } catch (err) {
        next(err)
    }
}

module.exports = {
    newuser,
    isusernameavailable,
    isemailavailable,
    resend,
    verifyyouremail
}