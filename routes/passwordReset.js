const express = require('express')
const router = express.Router()
const passwordResetController = require('../controllers/passwordReset')

router.get('/isexpired/:passwordresettoken', passwordResetController.isexpired)

router.get('/sendmail/:email', passwordResetController.sendmail)

router.post('/', passwordResetController.passwordReset)

module.exports = router