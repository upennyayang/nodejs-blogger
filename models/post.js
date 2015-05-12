let mongoose = require('mongoose')

let PostSchema = mongoose.Schema({
  title: {
    type: String,
    require: true
  },
  location: String,
  tags: String,
  // date: {
  //   type: Date,
  //   default: Date.now
  // },
  url: String,
  content: {
    type: String,
    required: true
  },
  image: {
    data: Buffer,
    contentType: String
  }
})

module.exports = mongoose.model('Post', PostSchema)
