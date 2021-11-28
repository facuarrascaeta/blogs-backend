require('dotenv').config()

const mongoUrl = process.env.MONGOURL
const PORT = process.env.PORT

module.exports = { mongoUrl, PORT }
