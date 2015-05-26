let mongoose = require('mongoose')
let Schema = mongoose.Schema

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
  comments: [{
    username: String,
    text: String,
    link: String,
    date: {type: Date, default: Date.now},
    upvote: Number,
    downvote: Number
  }],
  ratings: [{
    username: String,
    rating: Number
  }]
})

module.exports = mongoose.model('Post', PostSchema)
