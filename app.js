const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middlewares')
const mongoose = require('mongoose')
const mongoUrl = config.MONGODB_URI

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.logger)
app.use('/api/blogs', blogsRouter)

const unknownEndpoint = (request, response) => {
  middleware.error('Unknown endpoint reached')
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

module.exports = app

