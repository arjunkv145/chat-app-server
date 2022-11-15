const express = require('express')
const router = express.Router()
const signupController = require('../controllers/signup')

router.post('/new-user', signupController.newUser)

router.get('/is-username-available/:userName', signupController.isUsernameAvailable)

router.get('/is-email-available/:email', signupController.isEmailAvailable)

router.get('/verify-your-email/resend/:email', signupController.resend)

router.get('/verify-your-email/:emailVerificationToken', signupController.verifyYourEmail)

module.exports = router