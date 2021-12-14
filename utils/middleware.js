const jwt = require('jsonwebtoken')
const User = require('../models/user')

const logger = (request, response, next) => {
  console.log(request.method)
  console.log(request.path)
  console.log(request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'ValidationError') {
    response.status(400).send({error: error.message})
  } else if (error.name === 'JsonWebTokenError') {
    response.status(401).send({
      error: 'invalid token'
    })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('Authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }

  next()
}

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({
      error: 'missing or invalid token'
    })
  } 

  try {
    const user = await User.findById(decodedToken.id)
    request.user = user
  } catch (error) {
    next(error)
  }

  next()
}

module.exports = { errorHandler, tokenExtractor, userExtractor, logger }
