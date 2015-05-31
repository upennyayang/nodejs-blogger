let mongoose = require('mongoose')
let bcrypt = require('bcrypt')
let nodeify = require('bluebird-nodeify')
let strings = require('../strings')

require('songbird')

let userSchema = mongoose.Schema({
  username: {
    type: String,
    require: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  blogTitle: String,
  blogDescription: String,
  vanityUrl: String,
  tags: String,
  salt: String
})

userSchema.methods.generateSalt = function() {
  return bcrypt.genSaltSync(10)
}

userSchema.methods.generateHash = async function(password) {
  let PEPPER = strings.PEPPER
  return await bcrypt.promise.hash((password + this.salt + PEPPER), 8)
}

userSchema.methods.validatePassword = async function(password) {
  let PEPPER = strings.PEPPER
  return await bcrypt.promise.compare(password + this.salt + PEPPER, this.password)
}

// Password restriction
userSchema.path('password').validate(pw => {
  console.log("validating password", pw)
  return pw.length > 4 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw)
})

userSchema.path('username').validate(usr => {
  console.log("validating username")
  return /^\w*$/.test(usr)
})

// Validate password before save
userSchema.pre('save', function(next) {
  nodeify(async() => {
    if(!this.isModified('password')) return next()
    this.password = await this.generateHash(this.password)
  }(), next)
})

module.exports = mongoose.model('User', userSchema)
