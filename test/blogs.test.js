const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    const blogs = []

    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const blogs = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        likes: 5,
      },
    ]

    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    const blogs = [
      {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        likes: 7,
      },
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        likes: 5,
      },
      {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        likes: 12,
      },
    ]

    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 24)
  })
})

describe('favorite blog', () => {
  test('of empty list is null', () => {
    const blogs = []

    const result = listHelper.favoriteBlog(blogs)
    assert.strictEqual(result, null)
  })

  test('when list has only one blog equals that blog', () => {
    const blogs = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        likes: 5,
      },
    ]

    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, blogs[0])
  })

  test('of a bigger list is found right', () => {
    const blogs = [
      {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        likes: 7,
      },
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        likes: 5,
      },
      {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        likes: 12,
      },
    ]

    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, blogs[2])
  })
})

describe('most blogs', () => {
  test('of empty list is null', () => {
    const blogs = []

    const result = listHelper.mostBlogs(blogs)
    assert.strictEqual(result, null)
  } )

  test('when list has only one blog equals that author with 1 blog', () => {
    const blogs = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        likes: 5,
      },
    ]

    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      blogs: 1
    })
  })
  
  test('of a bigger list is found right', () => {
    const blogs = [
      {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        likes: 7,
      },
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        likes: 5,
      },
      {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12,
      },
    ]

    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      blogs: 2
    })
  })

  test('when multiple authors have same number of blogs, returns one of them', () => {
    const blogs = [
      {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        likes: 7,
      },
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        likes: 5,
      },
      {
        _id: '5a422ab71b64a676234d19f8',
        title: 'Go To Statement Considered Harmful 2',
        author: 'Edsger W. Dijkstra',
        likes: 8,
      },
      {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Michael Chan',
        likes: 12,
      },
    ]

    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, {
      author: 'Michael Chan',
      blogs: 2
    })
  })
})

describe('most likes', () => {
  test('of empty list is null', () => {
    const blogs = []

    const result = listHelper.mostLikes(blogs)
    assert.strictEqual(result, null)
  } )

  test('when list has only one blog equals that author with likes of that blog', () => {
    const blogs = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        likes: 5,
      },
    ]

    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 5
    })
  })
  
  test('of a bigger list is found right', () => {
    const blogs = [
      {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        likes: 7,
      },
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        likes: 5,
      },
      {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Michael Chan',
        likes: 12,
      },
    ]

    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, {
      author: 'Michael Chan',
      likes: 19
    })
  })

  test('when multiple authors have same number of likes, returns one of them', () => {
    const blogs = [
      {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        likes: 7,
      },
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        likes: 5,
      },
      {
        _id: '5a422ab71b64a676234d19f8',
        title: 'Go To Statement Considered Harmful 2',
        author: 'Edsger W. Dijkstra',
        likes: 8,
      },
      {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Michael Chan',
        likes: 6,
      },
    ]

    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, {
      author: 'Michael Chan',
      likes: 13
    })
  })
})