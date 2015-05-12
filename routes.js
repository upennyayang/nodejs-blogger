let multiparty = require('multiparty')
// let util = require('util')
let DataUri = require('datauri')
let then = require('express-then')
let fs = require('fs')
let isLoggedIn = require('./middleware/isLoggedIn')
let Post = require('./models/post')


require('songbird')

module.exports = (app) => {
  let passport = app.passport

  app.get('/', (req, res) => {
    res.render('index.ejs')
  })

  app.get('/login', (req, res) => {
    res.render('login', {message: req.flash('error')})
  })

  app.get('/signup', (req, res) => {
    res.render('signup', {message: req.flash('error')})
  })

  app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }))

  /**
  * Sign up page: post request
  */
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  /**
  * Sign up page: post request
  */
  app.get('/profile', isLoggedIn, then(async(req, res) => {
    let posts = await Post.promise.find()
    console.log(posts)
    res.render('profile.ejs', {
      user: req.user,
      posts: posts,
      message: req.flash('error')
    })
  }))

  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  /**
  * Post page: get request
  */
  app.get('/post/:postId?', then(async(req, res) => {
    let postId = req.params.postId

    /** Create mode */
    if(!postId) {
      res.render('post.ejs', {
        post: {
          title: "",
          location: "",
          tags: "",
          url: "",
          content: "",
          postId: ""
        },
        verb: 'Create'
      })
      return
    }

    /** Retrive from DB */
    let post = await Post.promise.findById(postId)
    if(!post) res.send(404, 'Not found')

    let dataUri = new DataUri()
    // console.log(post.image.contentType)
    let image = dataUri.format('.' + post.image.contentType.split('/').pop(), post.image.data)

    post.postId = postId
    console.log(post.postId, "erererer")

    res.render('post.ejs', {
      post: post,
      verb: 'Edit',
      image: `data: ${post.image.contentType};base64, ${image.base64}`
    })
  }))

  /**
  * Post: post request
  */
  app.post('/post/:postId?', then(async(req, res) => {
    let postId = req.params.postId
    console.log("PostID: ", postId)
    /** Create mode */
    if(!postId) {
      console.log("Creating new post")
      let post = new Post()

      //TODO: understand this
      let [{
        title: [title],
        location: [location],
        tags: [tags],
        // date: [date],
        url: [url],
        content: [content]
      }, {image: [file]}] =
        await new multiparty.Form().promise.parse(req)

      post.title = title
      post.location = location
      post.tags = tags
      // post.date = date
      post.url = url
      post.content = content

      post.image.data = await fs.promise.readFile(file.path)
      post.image.contentType = file.headers['content-type']

      // console.log(file, title, content, post.image.contentType)
      await post.save()

      try {
          res.redirect('/blog/' + encodeURI(req.user.blogTitle))
      } catch(e) {
        res.redirect('/')
      }
      return
    }

    console.log('Editing post.')

    /** Edit mode */
    let post = await Post.promise.findById(postId)
    if(!post) {
      res.send(404, 'Not found')
    }

    let [{
        title: [title],
        location: [location],
        tags: [tags],
        // date: [date],
        url: [url],
        content: [content]
      }, {image: [file]}] =
        await new multiparty.Form().promise.parse(req)


    post.title = title
    post.location = location
    post.tags = tags
    // post.date = date
    post.url = url
    post.content = content

    post.image.data = await fs.promise.readFile(file.path)
    post.image.contentType = file.headers['content-type']

    await post.save()

    try {
      res.redirect('/blog/' + encodeURI(req.user.blogTitle))
    } catch(e) {
      console.log(e)
      res.redirect('/')
    }

  }))

  /**
  * Top 25 passwords
  */
   app.get('/toppwds', (req, res) => {
    res.render('toppwds.ejs')
  })


}
