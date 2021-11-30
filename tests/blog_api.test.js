const app = require('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')
const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})

  for (const blog of initialBlogs) {
    const blogObject = new Blog(blog)
    await blogObject.save()
  }
})

const api = supertest(app)

test('the app returns the correct amount of blog posts', async () => {
  const blogs = await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/).expect('Content-Type', /application\/json/)

  expect(blogs.body).toHaveLength(initialBlogs.length)
})

test('the unique identifier property of the blog post is named id', async () => {
  const blogs = await api.get('/api/blogs')
  const blogToCheck = blogs.body[0]

  expect(blogToCheck.id).toBeDefined()
})

test('a new blog post is added to the database', async () => {
  const newBlog = {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await Blog.find({})
  const contents = blogsAtEnd.map(b => b.content)

  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
  expect(contents).toContain(newBlog.content)
  
})

test('if likes property is missing from the request, it will default to 0', async () => {
  const newBlog = {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
  }

  const request = await api
    .post('/api/blogs')
    .send(newBlog)
  
  const blogAdded = request.body
  expect(blogAdded.likes).toBe(0)
})

test('responds with 400 when title and url are missing', async () => {
  const newBlog = {
    author: 'Robert C. Martin',
    likes: 10
  }

  await api
    .post('/api/blogs/')
    .send(newBlog)
    .expect(400)
})

afterAll(() => {
  mongoose.connection.close()
})
