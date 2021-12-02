const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./helper.js')
const { connection } = require('mongoose')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('root', 10)
    const user = new User({
      username: 'root',
      name: 'Superuser',
      passwordHash
    })

    await user.save()
  }, 100000)

  test('adding a new user to db', async () => {
    const usersAtStart = await helper.getUsers()
    await api
      .post('/api/users')
      .send({ username: 'facundo', password: '1234' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await helper.getUsers()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)

    expect(usernames).toContain('facundo')
  }, 100000)

  test('usernames with less tha 3 characters are not created and return status code 400', async () => {
    const usersAtStart = await helper.getUsers()
    await api
      .post('/api/users')
      .send({ username: 'pe', name: 'peter', password: '1234' })
      .expect(400)

    const usersAtEnd = await helper.getUsers()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  }, 100000)

  test('not unique usernames are not added to db', async () => {
    const usersAtStart = await helper.getUsers()
    await api
      .post('/api/users')
      .send({ username: 'root', password: 'root' })
      .expect(400)

    const usersAtEnd = await helper.getUsers()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  }, 100000)



  afterAll(() => {
    connection.close()
  })
})