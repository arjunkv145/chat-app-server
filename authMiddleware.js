const jsonwebtoken = require('jsonwebtoken')
const User = require('./models/user')

module.exports = (req, res, next) => {
    if (req.headers.authorization) {
        const tokenParts = req.headers.authorization.split(' ')
        if (tokenParts[0] = 'Bearer' && tokenParts[1].match(/\S+\.\S+\.\S+/) !== null && tokenParts.length === 2) {
            try {
                verification = jsonwebtoken.verify(tokenParts[1], process.env.JWT_SECRET)
                User.findOne({ _id: verification.sub })
                    .then(user => {
                        req.user = user
                        next()
                    })
                    .catch(err => res.json({ success: false, message: "You are not authorized to access this resource" }))
            } catch (err) {
                res.json({ success: false, message: "You are not authorized to access this resource" })
            }
        } else {
            res.json({ success: false, message: "You are not authorized to access this resource" })
        }
    } else {
        res.json({ success: false, message: "You are not authorized to access this resource" })
    }
}