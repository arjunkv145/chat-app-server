const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    userName: String,
    email: String,
    password: String
})

module.exports = userSchema