require("dotenv").config()

const app = require("./src/app")
const { connectToDB } = require("./src/config/database")

const port = Number(process.env.PORT) || 3000

void connectToDB()

app.listen(port, () => {
    console.log(`[SERVER] API server is running on port ${port} in ${process.env.NODE_ENV || "development"} mode.`)
})
