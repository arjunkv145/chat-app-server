const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.HOST_MAIL_USER,
		pass: process.env.HOST_MAIL_PASS
	}
})

module.exports = transporter
