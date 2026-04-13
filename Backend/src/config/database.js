const mongoose = require("mongoose")

mongoose.set("bufferCommands", false)

const DB_RETRY_DELAY_MS = 5000

let isConnecting = false
let reconnectTimer = null
let listenersRegistered = false

function registerConnectionListeners() {
    if (listenersRegistered) {
        return
    }

    listenersRegistered = true

    mongoose.connection.on("connected", () => {
        console.log("[DB] MongoDB connection established.")
    })

    mongoose.connection.on("disconnected", () => {
        console.error("[DB] MongoDB disconnected.")
        scheduleReconnect()
    })

    mongoose.connection.on("error", (error) => {
        console.error(`[DB] MongoDB connection error: ${error.message}`)
    })
}

function clearReconnectTimer() {
    if (!reconnectTimer) {
        return
    }

    clearTimeout(reconnectTimer)
    reconnectTimer = null
}

function scheduleReconnect() {
    if (reconnectTimer || isConnecting || !process.env.MONGO_URI) {
        return
    }

    reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        void connectToDB()
    }, DB_RETRY_DELAY_MS)

    if (typeof reconnectTimer.unref === "function") {
        reconnectTimer.unref()
    }

    console.log(`[DB] Retrying MongoDB connection in ${DB_RETRY_DELAY_MS / 1000} seconds.`)
}

function isDatabaseConnected() {
    return mongoose.connection.readyState === 1
}

async function connectToDB() {
    registerConnectionListeners()

    if (isDatabaseConnected()) {
        return true
    }

    if (isConnecting) {
        return false
    }

    if (!process.env.MONGO_URI) {
        console.error("[DB] Missing MONGO_URI environment variable. MongoDB connection skipped.")
        return false
    }

    isConnecting = true
    clearReconnectTimer()

    try {
        console.log("[DB] Connecting to MongoDB...")

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        })

        return true
    } catch (error) {
        console.error(`[DB] Failed to connect to MongoDB: ${error.message}`)
        scheduleReconnect()
        return false
    } finally {
        isConnecting = false
    }
}

module.exports = {
    connectToDB,
    isDatabaseConnected
}
