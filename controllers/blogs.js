const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response, next) => {
  const body = request.body
  const token = request.token
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({
      error: 'missing or invalid token'
    })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user: user._id
  })

  try {
    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogRouter.delete('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  console.log(decodedToken)
  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'invalid or missing token'
    })
  }
  const blogid = request.params.id
  const userid = decodedToken.id
  try {
    const blogToRemove = await Blog.findById(blogid)
    console.log(blogToRemove)
    console.log('user id', userid, typeof userid)

    if (blogToRemove.user.toString() === userid) {
      blogToRemove.remove()
      response.status(204).end()
    } else {
      response.status(401).json({
        error: 'invalid token'
      })
    }
    // await Blog.findByIdAndRemove(id)
  
  } catch (error) {
    next(error)
  }
})

blogRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  const id = request.params.id

  try {
    const blogUpdated = await Blog.findByIdAndUpdate(id, { title: body.title }, { new: true })
    response.json(blogUpdated)
  } catch (error) {
    next(error)
  }
})

module.exports = blogRouter