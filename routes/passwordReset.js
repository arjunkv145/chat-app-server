const express = require('express')
const router = express.Router()
const passwordResetController = require('../controllers/passwordReset')

router.get('/is-expired/:passwordresettoken', passwordResetController.isExpired)

router.get('/send-mail/:email', passwordResetController.sendMail)

router.post('/', passwordResetController.passwordReset)

module.exports = router