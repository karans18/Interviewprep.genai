const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const { TOKEN_COOKIE_NAME } = require("../utils/cookie")

function getTokenFromRequest(req) {
    const cookieToken = req.cookies?.[TOKEN_COOKIE_NAME]
    const authorizationHeader = req.headers.authorization || ""

    if (cookieToken) {
        return cookieToken
    }

    if (authorizationHeader.startsWith("Bearer ")) {
        return authorizationHeader.slice(7).trim()
    }

    return null
}

async function authUser(req, res, next) {

    const token = getTokenFromRequest(req)

    if (!token) {
        console.warn(`[AUTH] Missing token for ${req.method} ${req.originalUrl}`)
        return res.status(401).json({
            success: false,
            message: "Authentication token is missing. Please log in again."
        })
    }

    try {
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token }).lean()

        if (isTokenBlacklisted) {
            console.warn(`[AUTH] Rejected blacklisted token for ${req.method} ${req.originalUrl}`)
            return res.status(401).json({
                success: false,
                message: "Session has expired. Please log in again."
            })
        }
    } catch (err) {
        return next(err)
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = {
            id: decoded.id,
            username: decoded.username
        }

        return next()
    } catch (err) {
        console.warn(`[AUTH] Invalid token for ${req.method} ${req.originalUrl}: ${err.message}`)

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please log in again."
        })
    }

}


module.exports = { authUser }
