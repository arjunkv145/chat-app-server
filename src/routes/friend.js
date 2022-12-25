const express = require('express')
const router = express.Router()
const friendController = require('../controllers/friend')
const verifyUser = require('../verifyUser')

router.get('/', verifyUser, friendController.friends)
router.get('/pending', verifyUser, friendController.pending)
router.get('/online', verifyUser, friendController.online)
router.get('/blocked', verifyUser, friendController.blocked)

router.post('/request', verifyUser, friendController.request)
router.post('/cancel-pending-request', verifyUser, friendController.cancelPendingRequest)
router.post('/unfriend', verifyUser, friendController.unfriend)
router.post('/block', verifyUser, friendController.block)
router.post('/unblock', verifyUser, friendController.unBlock)

router.post('/accept', verifyUser, friendController.accept)
router.post('/reject', verifyUser, friendController.reject)

module.exports = router