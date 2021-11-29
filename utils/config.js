require('dotenv').config()

const mongoUrl = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGOURL
  : process.env.MONGOURL

const PORT = process.env.PORT

module.exports = { mongoUrl, PORT }
