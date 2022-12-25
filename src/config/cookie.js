module.exports = {
	httpOnly: true,
	secure: true,
	signed: true,
	maxAge: process.env.REFRESH_TOKEN_EXPIRATION * 1000,
	sameSite: 'none'
}
