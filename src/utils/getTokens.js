const jwt = require('jsonwebtoken')

const getAccessToken = userId => {
	const payload = { sub: userId }
	const access_token_secret = process.env.ACCESS_TOKEN_SECRET
	const expiresIn = process.env.ACCESS_TOKEN_EXPIRATION

	const accessToken = jwt.sign(payload, access_token_secret, { expiresIn })

	return accessToken
}

const getRefreshToken = userId => {
	const payload = { sub: userId }
	const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET
	const expiresIn = process.env.REFRESH_TOKEN_EXPIRATION

	const refreshToken = jwt.sign(payload, refresh_token_secret, { expiresIn })

	return refreshToken
}

const getEmailVerificationToken = userId => {
	const payload = { sub: userId }
	const email_verification_token_secret =
		process.env.EMAIL_VERIFICATION_TOKEN_SECRET
	const expiresIn = process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION

	const emailVerificationToken = jwt.sign(
		payload,
		email_verification_token_secret,
		{ expiresIn }
	)

	return emailVerificationToken
}

const getPasswordResetToken = userId => {
	const payload = { sub: userId }
	const password_reset_token_secret = process.env.PASSWORD_RESET_TOKEN_SECRET
	const expiresIn = process.env.PASSWORD_RESET_TOKEN_EXPIRATION

	const passwordResetToken = jwt.sign(payload, password_reset_token_secret, {
		expiresIn
	})

	return passwordResetToken
}

module.exports = {
	getAccessToken,
	getRefreshToken,
	getEmailVerificationToken,
	getPasswordResetToken
}
