const errorHandler = (error, request, response, next) => {
  if (error.name === 'ValidationError') {
    response.status(400).send({error: error.message})
  } else if (error.name === 'JsonWebTokenError') {
    response.status(401).send({
      error: 'invalid missing token'
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

module.exports = { errorHandler, tokenExtractor }