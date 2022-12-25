const express = require('express')
const router = express.Router()
const groupController = require('../controllers/group')
const verifyUser = require('../verifyUser')

router.get('/', verifyUser, groupController.getGroups)

module.exports = router