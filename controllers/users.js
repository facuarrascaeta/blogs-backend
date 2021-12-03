const userRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

userRouter.post('/', async (request, response, next) => {
  const body = request.body

  const password = body.password
  if (password.length < 3) {
    return response.status(400).json({
      error: 'password must be at least 3 characters long'
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const newUser = new User({
    username: body.username,
    name: body.name,
    passwordHash
  })

  try {
    const savedUser = await newUser.save()
    response.json(savedUser)
  } catch (error) {
    next(error)
  }

})

userRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs', { url: 1, title: 1, author: 1 })
  response.json(users)
})

module.exports = userRouter
