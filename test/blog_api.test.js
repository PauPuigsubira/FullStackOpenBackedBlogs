const assert = require('node:assert');
const { test, describe, beforeEach, after } = require('node:test');
const mongoose = require('mongoose');
const supertest = require('supertest');
const Blog = require('../models/blog');
const app = require('../app');

const api = supertest(app);

const initialBlogs = [
  { title: 'First Blog', author: 'Author1', url: 'http://example.com/1', likes: 10 },
  { title: 'Second Blog', author: 'Author2', url: 'http://example.com/2', likes: 20 },
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
      const newBlog = {
        title: 'New Blog',
        author: 'Author3',
        url: 'http://example.com/3',
        likes: 30
      };
      
      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      const listOfBlogs = await api.get('/api/blogs');
      assert.strictEqual(listOfBlogs.body.length, initialBlogs.length + 1);
  
      //const newAddedBlog = response.body.find(blog => blog.title === 'New Blog');
      
      //const newBlogObject = await Blog.findById(newAddedBlog.id);
      const { id, ...newBlogData } = response.body;
    
      assert.deepStrictEqual(newBlogData, newBlog);
    });
    
    test('blog without likes defaults to 0', async () => {
      const newBlog = {
        title: 'Blog Without Likes',
        author: 'Author4',
        url: 'http://example.com/4'
      };
      
      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      assert.strictEqual(response.body.likes, 0);
    });

    test('blog without title or url is not added', async () => {
      const newBlog1 = { author: 'Author5', url: 'http://example.com/5', likes: 5 };
      const newBlog2 = { title: 'No URL Blog', author: 'Author6' };
      
      await api
        .post('/api/blogs')
        .send(newBlog1)
        .expect(400);
  
      await api
        .post('/api/blogs')
        .send(newBlog2)
        .expect(400);
      
      const listOfBlogs = await api.get('/api/blogs');
      assert.strictEqual(listOfBlogs.body.length, initialBlogs.length);
    });
    
  });

  describe('deleting a blog', () => {
    test('a blog can be deleted', async () => {
      const blogsAtStart = await api.get('/api/blogs');
      const blogToDelete = blogsAtStart.body[0];
      console.log('Blog to delete:', blogToDelete);
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204);

      const blogsAtEnd = await api.get('/api/blogs');
      assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length - 1);

      const titles = blogsAtEnd.body.map(b => b.title);
      assert.ok(!titles.includes(blogToDelete.title));
    });
  
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