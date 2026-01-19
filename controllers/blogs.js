const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { SECRET } = require('../utils/config')
const jwt = require('jsonwebtoken')
const middlewares = require('../utils/middlewares')

/* Working with promises
blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})
*/

// Working with async/await
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('author', { username: 1, name: 1, id: 1 })

  response.json(blogs)
})

// Working with async/await
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})
/* Working with promises
blogsRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})
*/
// Working with async/await
blogsRouter.post('/', middlewares.userExtractor, async (request, response) => {
  const blog = new Blog(request.body)  
/*
  const users = await User.find({});
  console.log('Available users for blog authorship:', users);
  const user = users[0];
 */
  //const token = request.token

  //if (!token) {
  //  return response.status(401).json({ error: 'token missing' })
  //}
  
  //const decodedToken = jwt.verify(token, SECRET)
  //if (!token || !decodedToken.id) {
  //  return response.status(401).json({ error: 'token missing or invalid' })
  //}

  //const user = await User.findById(decodedToken.id)
  const user = request.user

  if (!user) {
    return response.status(401).json({ error: 'user missing or invalid'})
  }

  blog.author = user;

  // Validate the blog before saving
  try {
    await blog.validate()
  } catch (error) {
    return response.status(400).json({ error: error.message })
  }
  //console.log('new blog to insert (after validation):', blog);
  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middlewares.userExtractor, async (request, response) => {
  //const token = request.token
  
  //if (!token) {
  //  return response.status(401).json({ error: 'token missing' })
  //}

  //const decodedToken = jwt.verify(token, SECRET)

  //if (!token || !decodedToken.id) {
  //    return response.status(401).json({ error: 'token missing or invalid' })
  //}
  const user = request.user
  //console.log('user request', user)
  const db_blog = await Blog.findById(request.params.id)
  
  //console.log('db_blog to delete', db_blog)
  if (!db_blog) {
    return response.status(404).json({ error: 'blog not found' })
  }
  //console.log('author', db_blog.author, 'id', db_blog.author.toString())
  if ( db_blog.author.toString() !== user ) {
    return response.status(403).json({ error: 'only the author can delete this blog' })
  }

  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    console.error(error.message)
    response.status(400).json({ error: 'malformatted id' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const { likes } = request.body

  const blog = {
    likes,
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      blog,
      { new: true, runValidators: true, context: 'query' }
    )
    if (updatedBlog) {
      response.json(updatedBlog)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    console.error(error.message)
    response.status(400).json({ error: 'malformatted id' })
  }
})

module.exports = blogsRouter
