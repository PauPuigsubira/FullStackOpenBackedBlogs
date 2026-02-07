const assert = require('node:assert');
const { test, describe, beforeEach, after } = require('node:test');
const mongoose = require('mongoose');
const supertest = require('supertest');
const Blog = require('../models/blog');
const app = require('../app');
const { SECRET } = require('../utils/config');
const jwt = require('jsonwebtoken');
const helper = require('./test_helper');
const User = require('../models/user');

/*
  Ejecución pruebas con only: npm test -- --test-only
*/

const api = supertest(app);

const initialBlogs = [
  { title: 'First Blog', user: '69875b0e8216930735b3fc1d', author: 'John Doe', url: 'http://example.com/1', likes: 10 },
  { title: 'Second Blog', user: '696bab8879637c6d57c10fe1', author: 'Jane Smith', url: 'http://example.com/2', likes: 20 },
];

describe('API Blog Tests', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    //console.log('Cleared Blog collection');
    const blogObjects = initialBlogs.map(blog => new Blog(blog));
    //console.log('Created blog objects');
    const promiseArray = blogObjects.map(blog => blog.save());
    await Promise.all(promiseArray);
    //console.log('Saved initial blogs to database');
  });

  describe('selecting blogs', () => {
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });
    
    test('all blogs are returned', async () => {
      const response = await api.get('/api/blogs');
      
      assert.strictEqual(response.body.length, initialBlogs.length);
    });

    test('The unique identifier property of the blog posts is named id', async () => {
      const response = await api.get('/api/blogs');
      response.body.forEach(blog => {
        assert.ok(blog.id);
      });
    });

  });

  describe('adding a new blog', () => {
    test('a valid blog can be added', async () => {
      const token = await helper.generateToken();
      const newBlog = {
        title: 'New Blog',
        author: 'New Author',
        url: 'http://example.com/3',
        likes: 30
      };
      
      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      const listOfBlogs = await api.get('/api/blogs');
      assert.strictEqual(listOfBlogs.body.length, initialBlogs.length + 1);
  
      //const newAddedBlog = response.body.find(blog => blog.title === 'New Blog');
      
      //const newBlogObject = await Blog.findById(newAddedBlog.id);
      const { id, ...newBlogData } = response.body;
      newBlog.user = newBlogData.user; // Convert ObjectId to string for comparison
    
      assert.deepStrictEqual(newBlogData, newBlog);
    });
    
    test('blog without likes defaults to 0', async () => {
      const token = await helper.generateToken();
      const newBlog = {
        title: 'Blog Without Likes',
        author: 'Author Without Likes',
        url: 'http://example.com/4'
      };
      
      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      assert.strictEqual(response.body.likes, 0);
    });

    test('blog without title or url is not added', async () => {
      const token = await helper.generateToken();
      const newBlog1 = { url: 'http://example.com/5', author: 'Author Without Title', likes: 5 };
      const newBlog2 = { title: 'No URL Blog', author: 'Author Without URL', likes: 5 };
      
      await api
        .post('/api/blogs')
        .send(newBlog1)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
  
      await api
        .post('/api/blogs')
        .send(newBlog2)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
      
      const listOfBlogs = await api.get('/api/blogs');
      assert.strictEqual(listOfBlogs.body.length, initialBlogs.length);
    });

    test('a blog without token cannot be added', async () => {
      const newBlog = { title: 'New Blog 5', url: 'http://example.com/5', likes: 30 };

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      const listOfBlogs = await api.get('/api/blogs');
      assert.strictEqual(listOfBlogs.body.length, initialBlogs.length);
    
    })
    
});

  describe('deleting a blog', () => {
    test('a blog can be deleted by the user who added it', async () => {
      const blogsAtStart = await api.get('/api/blogs');
      const blogToDelete = blogsAtStart.body[0];

      const db_blog = await Blog.findById(blogToDelete.id)

      const token = await helper.generateToken(db_blog.user.toString());

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const blogsAtEnd = await api.get('/api/blogs');
      assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length - 1);

      const titles = blogsAtEnd.body.map(b => b.title);
      assert.ok(!titles.includes(blogToDelete.title));
    });

    test('A blog cannot be deleted by other authors', async () => {
      const blogsAtStart = await api.get('/api/blogs')
      const blogToDelete = blogsAtStart.body[0]

      const token = await helper.generateToken()

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)

      const blogsAtEnd = await api.get('/api/blogs');
      assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length);
    });
/* Obsolete. New middleware to get user from token.
    test('A token is required', async () => {
      const blogsAtStart = await api.get('/api/blogs');
      const blogToDelete = blogsAtStart.body[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(401)

        const blogsAtEnd = await api.get('/api/blogs');
        assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length);
        
    })
*/  
  });

  describe('updating a blog', () => {
    test('a blog can be updated', async () => {
      const blogsAtStart = await api.get('/api/blogs');
      const blogToUpdate = blogsAtStart.body[0];
      
      const updatedBlogData = { likes: blogToUpdate.likes + 1 };
      await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlogData);
      const blogsAtEnd = await api.get('/api/blogs');
      const updatedBlog = blogsAtEnd.body.find(b => b.id === blogToUpdate.id);
      assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1);
    });
  
  });

  after(async () => {
    await mongoose.connection.close();
  });
});