let mongoose = require('mongoose')

let PostSchema = mongoose.Schema({
  title: {
    type: String,
    require: true
  },
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
