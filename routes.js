let multiparty = require('multiparty')
// let util = require('util')
let DataUri = require('datauri')
let then = require('express-then')
let fs = require('fs')
let ejs= require('ejs')
let moment = require('moment')
let isLoggedIn = require('./middleware/isLoggedIn')
let Post = require('./models/post')
let User = require('./models/user')



require('songbird')

module.exports = (app) => {
  let passport = app.passport

  app.get('/', (req, res) => {
    res.render('index.ejs')
  })

  // -- Log In

  app.get('/login', (req, res) => {
    res.render('login', {message: req.flash('error')})
  })


  app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }))

  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  // -- Sign up

  app.get('/signup', (req, res) => {
    res.render('signup', {message: req.flash('error')})
  })

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  // -- Profile

  app.get('/profile', isLoggedIn, then(async(req, res) => {
    let posts = await Post.promise.find()
    console.log(posts)
    res.render('profile.ejs', {
      user: req.user,
      posts: posts,
      message: req.flash('error')
    })
  }))


  // -- Post

  app.get('/post/:postId?', then(async(req, res) => {
    let postId = req.params.postId

    /* Create mode */
    if(!postId) {
      res.render('post.ejs', {
        post: {
          title: "",
          location: "",
          tags: "",
          date: moment().format("YYYY-MM-DD"),
          url: "",
          content: "",
          postId: ""
        },
        verb: 'Create'
      })
      return
    }

    /* Retrive from DB */
    let post = await Post.promise.findById(postId)
    if(!post) res.send(404, 'Not found')

    let dataUri = new DataUri()
    let image = dataUri.format('.' + post.image.contentType.split('/').pop(), post.image.data)

    post.postId = postId
    console.log(post.postId, "erererer")

    res.render('post.ejs', {
      post: post,
      verb: 'Edit',
      image: `data: ${post.image.contentType};base64, ${image.base64}`
    })
  }))

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
        date: [date],
        url: [url],
        content: [content]
      }, {image: [file]}] =
        await new multiparty.Form().promise.parse(req)

      post.title = title
      post.location = location
      post.tags = tags
      post.date = date
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

  app.get('/toppwds', (req, res) => {
    res.render('toppwds.ejs')
  })

  // -- Blog

  app.get('/blog/:username', then(async(req, res) => {
    let username = req.params.username
    let user = await User.promise.findOne({username: username})
    if(!user) res.render('error.ejs', {message: 'User not found.'})
    console.log(username)
    res.render('blog.ejs', {
      username: username
    })
  }))

}
