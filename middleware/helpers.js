let moment = require('moment')

module.exports = (app) => {

  app.locals.prettyDate = function(date) {
    return moment(date).format("YYYY-MM-DD HH:mm")
  }

  app.locals.shortDate = function(date) {
    return moment(date).format("MMM DD, YYYY")
  }

  app.locals.recentDate = function(d1, d2) {
    let recent
    let d2After = moment(d2).isAfter(d1)
    if(d2After) {
      recent = d2
    } else {
      recent = d1
    }
    return moment(recent).format("MMM DD, YYYY")
  }

  app.locals.commentCount = function(comments) {
    return comments ? comments.length : 0
  }

  app.locals.aggregateRating = function(ratings) {
    return ratings ? ratings.length : "No Ratings"
  }

  app.locals.minus = function(x, y) {
    return x - y;
  }
}

