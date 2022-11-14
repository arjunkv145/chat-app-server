const express = require('express')
const router = express.Router()
const logoutController = require('../controllers/logout')

router.get('/', logoutController.logout)
router.get('/all', logoutController.logoutAll)

module.exports = router