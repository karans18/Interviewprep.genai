const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const {
    TOKEN_COOKIE_NAME,
    getTokenCookieOptions,
    getClearTokenCookieOptions
} = require("../utils/cookie")

function createAuthToken(user) {
    if (!process.env.JWT_SECRET) {
        const error = new Error("JWT_SECRET is not configured on the server.")
        error.status = 500
        throw error
    }

    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )
}

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            success: false,
            message: "Account already exists with this email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = createAuthToken(user)

    res.cookie(TOKEN_COOKIE_NAME, token, getTokenCookieOptions())


    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid email or password"
        })
    }

    const token = createAuthToken(user)

    res.cookie(TOKEN_COOKIE_NAME, token, getTokenCookieOptions())
    res.status(200).json({
        success: true,
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies?.[TOKEN_COOKIE_NAME]

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie(TOKEN_COOKIE_NAME, getClearTokenCookieOptions())

    res.status(200).json({
        success: true,
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        })
    }


    res.status(200).json({
        success: true,
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}



module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
