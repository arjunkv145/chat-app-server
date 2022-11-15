const express = require('express')
const router = express.Router()
const friendController = require('../controllers/friend')

router.post('/request', friendController.request)

router.get('/', friendController.friends)

router.get('/pending', friendController.pending)

module.exports = router