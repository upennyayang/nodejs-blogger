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

  app.locals.arrayCount = function(arr) {
    return arr ? arr.length : 0
  }

  app.locals.avgRating = function(arr) {
    let sum = 0
    let avg

    if(!arr || arr.length === 0) {
      return 'N/A';
    }

    arr.forEach(function(item) {
      sum += parseFloat(item.score) || 0
    })
    avg = (sum/arr.length).toFixed(1)

    return avg
  }

  app.locals.minus = function(x, y) {
    console.log(x - y);
    return x - y;
  }
}

