const lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  return blogs.reduce((fav, blog) => (blog.likes > fav.likes ? blog : fav), blogs[0])
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  } 
/*
  const blogCounts = blogs.reduce((counts, blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
    return counts
  }, {})

  const maxBlogs = Math.max(...Object.values(blogCounts))
  const authorWithMostBlogs = Object.keys(blogCounts).find(
    author => blogCounts[author] === maxBlogs
  )

  return {
    author: authorWithMostBlogs,
    blogs: maxBlogs
  }
  */
  const grouped = lodash.groupBy(blogs, 'author')
  //console.log(grouped)
  const authorBlogCounts = lodash.mapValues(grouped, group => group.length)
  // console.log(authorBlogCounts)
  const authorWithMostBlogs = lodash.maxBy(
    Object.keys(authorBlogCounts),
    author => authorBlogCounts[author]
  )

  return {
    author: authorWithMostBlogs,
    blogs: authorBlogCounts[authorWithMostBlogs]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  } 

  const grouped = lodash.groupBy(blogs, 'author')
  const authorLikeCounts = lodash.mapValues(grouped, group => 
    group.reduce((sum, blog) => sum + blog.likes, 0)
  )

  const authorWithMostLikes = lodash.maxBy(
    Object.keys(authorLikeCounts),
    author => authorLikeCounts[author]
  )

  return {
    author: authorWithMostLikes,
    likes: authorLikeCounts[authorWithMostLikes]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}