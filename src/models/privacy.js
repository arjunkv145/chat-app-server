const mongoose = require('mongoose')
const { Schema } = mongoose

const PrivacySchema = new Schema({
    userName: {
        type: String,
        default: ''
    },
    online: {
        type: String,
        enum: ['Everyone', 'My friends'],
        default: 'My friends'
    },
    lastSeen: {
        type: String,
        enum: ['Everyone', 'My friends'],
        default: 'My friends'
    },
    acceptMessageFrom: {
        type: String,
        enum: ['Everyone', 'My friends'],
        default: 'My friends'
    },
    canAddMeToGroup: {
        type: String,
        enum: ['Everyone', 'My friends'],
        default: 'My friends'
    }
})

const Privacy = mongoose.model('Privacy', PrivacySchema)

module.exports = Privacy
