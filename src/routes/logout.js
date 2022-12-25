const express = require('express')
const router = express.Router()
const logoutController = require('../controllers/logout')

router.post('/', logoutController.logout)
router.post('/all', logoutController.logoutAll)

module.exports = router