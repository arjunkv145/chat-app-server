const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    signed: true,
    maxAge: eval(process.env.REFRESH_TOKEN_EXPIRATION) * 1000,
    sameSite: "none",
}
const CORS_OPTIONS = {
    origin: process.env.WHITELISTED_DOMAIN,
    credentials: true
}

module.exports = {
    COOKIE_OPTIONS,
    CORS_OPTIONS
}