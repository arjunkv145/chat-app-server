const express = require('express')
const router = express.Router()
const friendController = require('../controllers/friend')
const verifyUser = require('../verifyUser')

router.post('/request', verifyUser, friendController.request)

router.get('/', verifyUser, friendController.friends)

router.get('/pending', verifyUser, friendController.pending)

router.post('/accept', verifyUser, friendController.accept)

router.post('/reject', verifyUser, friendController.reject)

router.post('/unfriend', verifyUser, friendController.unfriend)

module.exports = router