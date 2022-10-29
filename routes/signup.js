const express = require('express')
const router = express.Router()
const signupController = require('../controllers/signup')

router.post('/newuser', signupController.newuser)

router.get('/isusernameavailable/:userName', signupController.isusernameavailable)

router.get('/isemailavailable/:email', signupController.isemailavailable)

router.get('/verifyyouremail/resend/:email', signupController.resend)

router.get('/verifyyouremail/:emailVerificationToken', signupController.verifyyouremail)

module.exports = router