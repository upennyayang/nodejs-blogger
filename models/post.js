let mongoose = require('mongoose')
let Schema = mongoose.Schema

let CommentSchema = new Schema({
  username: String,
  content: String,
  postLink: String,
  commentDate: String,
  upvoteCount: Number,
  downvoteCount: Number
})

let RatingSchema = new Schema({
  username: String,
  rating: Number
})

let PostSchema = new Schema({
  id: mongoose.Schema.ObjectId,
  username: String,
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
  image: String,
  comments: [CommentSchema],
  ratings: [RatingSchema]
})

module.exports = mongoose.model('Post', PostSchema)
