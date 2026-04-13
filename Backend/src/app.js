const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const { isDatabaseConnected } = require("./config/database")

const app = express()

app.set("trust proxy", 1)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

function normalizeOrigin(origin) {
    return origin?.trim().replace(/\/+$/, "")
}

function getAllowedOrigins() {
    const defaultOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://interviewprep-genai.onrender.com"
    ]

    const envOrigins = [
        process.env.FRONTEND_URL,
        process.env.CLIENT_URL,
        process.env.CORS_ORIGINS
    ]
        .filter(Boolean)
        .flatMap((value) => value.split(","))
        .map(normalizeOrigin)
        .filter(Boolean)

    return [ ...new Set([ ...defaultOrigins.map(normalizeOrigin), ...envOrigins ]) ]
}

const allowedOrigins = getAllowedOrigins()

const corsOptions = {
    origin(origin, callback) {
        const normalizedOrigin = normalizeOrigin(origin)

        if (!normalizedOrigin) {
            return callback(null, true)
        }

        if (allowedOrigins.includes(normalizedOrigin)) {
            return callback(null, true)
        }

        console.warn(`[CORS] Blocked request from origin: ${normalizedOrigin}`)
        return callback(new Error(`Origin ${normalizedOrigin} is not allowed by CORS.`))
    },
    credentials: true
}

app.use((req, res, next) => {
    const startedAt = Date.now()
    const origin = req.headers.origin || "no-origin"

    console.log(`[REQ] ${req.method} ${req.originalUrl} | origin=${origin}`)

    res.on("finish", () => {
        console.log(`[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt}ms)`)
    })

    next()
})

app.use(cors(corsOptions))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.get("/", (req, res) => res.send("API is running"))

app.use("/api", (req, res, next) => {
    if (isDatabaseConnected()) {
        return next()
    }

    console.error(`[DB] Rejecting ${req.method} ${req.originalUrl} because MongoDB is unavailable.`)

    return res.status(503).json({
        success: false,
        message: "Database connection is unavailable. Please try again shortly."
    })
})

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found.`
    })
})

app.use((err, req, res, next) => {
    console.error("[ERROR]", err)

    if (err.name === "MongoServerSelectionError" || err.name === "MongooseServerSelectionError") {
        return res.status(503).json({
            success: false,
            message: "Database connection is unavailable. Please try again shortly."
        })
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message || "Validation failed."
        })
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid resource identifier."
        })
    }

    if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "Resume must be 5MB or smaller."
        })
    }

    return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error."
    })
})


module.exports = app
