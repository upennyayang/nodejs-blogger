let multiparty = require('multiparty')
let then = require('express-then')
let fs = require('fs')
let imageurl = require('./utils/imageurl')
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
    let username = req.user.username
    let posts = await Post.promise.find({username: username})
    let comments = await Post.promise.find({
      comments: {
        $elemMatch: {
          username: username
        }
      }
    })

    res.render('profile.ejs', {
      user: req.user,
      posts: posts,
      comments: comments,
      message: req.flash('error')
    })
  }))


  // -- Post

  app.get('/post/:postId?', isLoggedIn, then(async(req, res) => {
    let postId = req.params.postId

    /* Create a new post */
    if(!postId) {
      res.render('post.ejs', {
        post: {
          title: "",
          location: "",
          tags: "",
          date: moment().format("YYYY-MM-DD"),
          url: "",
          content: "",
          _id: ""
        },
        verb: 'Create'
      })
      return
    }

    /* Edit an exisiting post */
    let post = await Post.promise.findById(postId)
    if(!post) res.render("error.ejs", {message: "Post not found."})

    res.render('post.ejs', {
      post: post,
      verb: 'Edit'
    })
  }))

  app.post('/post/:postId?', then(async(req, res) => {
    let postId = req.params.postId
    let username = req.user.username

    /* Create a new post: sumbit */
    if(!postId || postId === 'undefined') {
      console.log("!!!!!!!Submit a new post, postId: ", postId)
      let post = new Post()

      let [{
        title: [title],
        location: [location],
        tags: [tags],
        date: [date],
        url: [url],
        content: [content]
      }, {image: [file]}] =
        await new multiparty.Form().promise.parse(req)

      post.username = username,
      post.title = title
      post.location = location
      post.tags = tags
      post.date = date
      post.url = url
      post.content = content
      post.image = imageurl(
        file.headers['content-type'],
        await fs.promise.readFile(file.path)
      )

      try {
        await post.save()
        res.redirect('/blog/' + encodeURI(req.user.blogTitle))
      } catch(e) {
        res.redirect('/')
      }
      return
    }

    console.log("!!!!!!!Submit an existing post, postId: ", postId)

    /* Edit an existing post: sumbit */
    let post = await Post.promise.findById(postId)
    if(!post) res.render('error.ejs', 'Post not found.')

    let [{
        title: [title],
        location: [location],
        tags: [tags],
        date: [date],
        url: [url],
        content: [content]
      }, {image: [file]}] =
        await new multiparty.Form().promise.parse(req)

    post.username = username,
    post.title = title
    post.location = location
    post.tags = tags
    post.date = date
    post.url = url
    post.content = content
    post.image = imageurl(
      file.headers['content-type'],
      await fs.promise.readFile(file.path)
    )

    try {
      await post.save()
      res.redirect('/blog/' + encodeURI(req.user.blogTitle))
    } catch(e) {
      console.log(e)
      res.redirect('/')
    }

  }))


  app.delete('/post/:postId?', then(async(req, res) => {
    let postId = req.params.postId
    console.log('Deleting post: ', postId)

    if(!postId) {
      res.error('error.ejs', {message: 'There is no post you requested.'})
    }

    await Post.promise.findOneAndRemove(postId)
    res.redirect('/profile')
  }))

  app.get('/toppwds', (req, res) => {
    res.render('toppwds.ejs')
  })

  app.get('/posts', then(async(req, res) => {
    let posts = await Post.promise.find({})
    console.log(posts)
    res.render('posts.ejs', {
      posts: posts,
      username: req.user ? req.user.username : null
    })
  }))

  // -- Blog

  app.get('/blog/:blogger', then(async(req, res) => {
    let blogger = req.params.blogger
    let posts = await Post.promise.find({username: blogger})
    if(!posts || posts.length === 0) res.render('error.ejs', {message: username + ' has no posts yet.'})

    console.log("Finding blog for username[username]: ", blogger)
    console.log("Finding blog for username[result]: ", posts.length)
    res.render('blog.ejs', {
      blogger: blogger,
      posts: posts,
      username: req.user ? req.user.username : null
    })
  }))


  // My posts
  app.get('/blog', isLoggedIn, then(async(req, res) => {
    let username = req.user.username
    res.redirect('/blog/' + username)
  }))

  // One post
  app.get('/blog/:blogger/:postId', then(async(req, res) => {
    let blogger = req.params.blogger
    let postId = req.params.postId

    let post = await Post.promise.find({
      $and: [{_id: postId}, {username: blogger}]
    })
    if(!post) res.render('error.ejs', {message: 'User not found.'})

    res.render('blog.ejs', {
      posts: post,  // Only shows one post
      blogger: blogger, // The blogger who wrote the post
      username: req.user ? req.user.username : null // The user who views the post
    })
  }))

  // - Comment

  app.post('/comment', then(async(req, res) => {
    let {postId, blogger, comment} = req.body
    let username = req.user.username

    await Post.promise.update({_id: postId}, {$push: {comments: {
      username: username,
      blogger: blogger,
      text: comment,
      link: `/blog/${blogger}/${postId}`
    }}})

    res.redirect(`/blog/${blogger}/${postId}`)
  }))

   app.post('/login-comment', passport.authenticate('login-comment', {
    successRedirect: '/blog',
    failureRedirect: '/blog',
    failureFlash: true
  }))

  app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }))

  // - Public Profile

  app.get('/public/:blogger?', isLoggedIn, then(async(req, res) => {
    let blogger = req.params.blogger
    let username = req.user.username
    let user
    let posts
    let comments

    // create a public profile
    if(!blogger || blogger === 'undefined') {
      res.redirect('/public/' + username)
    }

    // get public profile
    user = await User.promise.findOne({username: blogger})
    if(!user) {
      res.render('error.ejs', {message: 'Cannot find this blogger.'})
    }

    comments = await Post.promise.find({
      comments: {
        $elemMatch: {
          username: username
        }
      }
    })
    console.log(comments)

    posts = await Post.promise.find({username: blogger})
    res.render('public.ejs', {
      username: username,
      user: user,
      posts: posts,
      comments: comments
    })
  }))

  // link of the public profile
  // no need to be logged in
  app.get('/pp/:blogger', then(async(req, res) => {
    let blogger = req.params.blogger
    res.render('public.ejs', {
      blogger: blogger,
      username: req.user ? req.user.username : null
    })
  }))
}
