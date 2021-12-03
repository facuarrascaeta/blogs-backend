const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response, next) => {
  const body = request.body
  const users = await User.find({})
  const creator = users[0]

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user: creator._id
  })

  try {
    const savedBlog = await blog.save()

    creator.blogs = creator.blogs.concat(savedBlog._id)
    await creator.save()

    response.json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    await Blog.findByIdAndRemove(id)
    response.status(204).end()
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