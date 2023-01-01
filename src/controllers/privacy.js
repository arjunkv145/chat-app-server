const Privacy = require('../models/privacy')
const privacyOptions = ['Everyone', 'My friends', 'No one']
const privacyOptionIds = [1, 2, 3, 4]

const changePrivacy = async (req, res, next) => {
    const { userName } = req.user
    const { optionId, option } = req.body

    try {
        if (privacyOptions.includes(option) === false) {
            return res
                .status(400)
                .json({ message: 'This option is not available' })
        }
        if (privacyOptionIds.includes(optionId) === false) {
            return res
                .status(400)
                .json({ message: 'This option is not available' })
        }
        const privacyCollection = await Privacy.findOne({ userName })
        if (privacyCollection === null) {
            return res.status(404).json({ message: 'Not found' })
        }
        if (optionId === 1) {
            privacyCollection.online = option
        } else if (optionId === 2) {
            privacyCollection.lastSeen = option
        } else if (optionId === 3) {
            privacyCollection.acceptRequestFrom = option
        } else if (optionId === 4) {
            privacyCollection.canAddMeToGroup = option
        }
        await privacyCollection.save()
        res.json({ message: 'Your settings has been changed!' })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    changePrivacy
}
