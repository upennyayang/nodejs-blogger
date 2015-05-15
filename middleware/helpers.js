let moment = require('moment')

module.exports = (app) => {

  app.locals.prettyDate = function(date) {
    return moment(date).format("YYYY-MM-DD HH:mm")
  }

  app.locals.commentCount = function(comments) {
    return comments ? comments.length : 0
  }

  app.locals.aggregateRating = function(ratings) {
    return ratings ? ratings.length : "no ratings"
  }
}

