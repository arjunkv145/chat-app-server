const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chat')
const verifyUser = require('../verifyUser')

router.get('/', verifyUser, chatController.chats)
router.get('/:chatId', verifyUser, chatController.chatRoom)
router.get('/messages/:chatId', verifyUser, chatController.messages)

router.get('/search/:userName', verifyUser, chatController.search)
router.post('/add/', verifyUser, chatController.add)
router.post('/remove/', verifyUser, chatController.remove)

module.exports = router