let mongoose = require('mongoose')
let Schema = mongoose.Schema

let CommentSchema = new Schema({
  title: String,
  body: String,
  date: Date
})

let PostSchema = new Schema({
  id: mongoose.Schema.ObjectId,
  title: {
    type: String,
    require: true
  },
  location: String,
  tags: String,
  releaseDate: {
    type: Date,
    default: Date.now
  },
  modificationDate: {
    type: Date,
    default: Date.now
  },
  url: String,
  content: {
    type: String,
    required: true
  },
  image: String
  // comments: [CommentSchema]
})

module.exports = mongoose.model('Post', PostSchema)
