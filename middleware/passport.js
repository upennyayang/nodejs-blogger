let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
let User = require('../models/user')
let Post = require('../models/post')

module.exports = (app) => {
  let passport = app.passport

  /**
  * strategy: log in
  */
  passport.use(new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'username',
    failureFlash: true
  }, nodeifyit(async (username, password) => {
    // Identify if it's username or email
    let user
    let isEmail = username.indexOf('@') > 0

    if(isEmail) {
      let email = username.toLowerCase()
      user = await User.promise.findOne({email})
    } else {
      let query = {
        username: {
          $regex: username,
          $options: 'i'
        }
      }
      user = await User.promise.findOne(query)
    }

    if (!user) {
      return [false, {message: 'Invalid username / email'}]
    }

    if (!await user.validatePassword(password)) {
      return [false, {message: 'Invalid password'}]
    }
    return user
  }, {spread: true})))

  passport.serializeUser(nodeifyit(async (user) => user._id))
  passport.deserializeUser(nodeifyit(async (id) => {
    return await User.promise.findById(id)
  }))

  /**
  * strategy: sign up
  */
  passport.use('local-signup', new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email',
    failureFlash: true,
    passReqToCallback: true
  }, nodeifyit(async (req, email, password) => {
      email = (email || '').toLowerCase()

      let {username, title, description, url, tags} = req.body

      if (await User.promise.findOne({username})) {
        return [false, {message: 'That username is already taken.'}]
      }

      if(await User.promise.findOne({email})) {
        return [false, {message: 'That email is already taken'}]
      }
      // create the user
      let user = new User()
      user.username = username
      user.email = email
      user.password = password
      user.blogTitle = title
      user.blogDescription = description
      user.vanityUrl = url
      user.tags = tags

      user.salt = user.generateSalt()

      try {
        return await user.save()
      } catch(e) {
        return [false, {message: 'Please change to a valid formated username or password.'}]
      }

  }, {spread: true})))


  /**
  * strategy: comment
  */
  passport.use('login-comment', new LocalStrategy({
    usernameField: "username",
    failureFlash: true,
    passReqToCallback: true
  }, nodeifyit(async(req, username, password) => {
    let user
    let isEmail = username.indexOf('@') > 0

    if(isEmail) {
      let email = username.toLowerCase()
      user = await User.promise.findOne({email: email})
    } else {
      user = await User.promise.findOne({username: {$regex: username, $options: 'i'}})
    }

    if(!user) {
      return [false, {message: 'Invalid username / email.'}]
    }
    // console.log("here", username, password)
    if(!await user.validatePassword(password)) {
      return [false, {message: 'Invalid password.'}]
    }

    // Insert comment
    let {postId, comment} = req.body
    console.log(username, postId, comment)


    await Post.promise.update({_id: postId}, {$push: {comments: {
      username: username,
      text: comment
    }}})

    return user
  }, {spread: true})))

}
