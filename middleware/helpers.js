let moment = require('moment')

module.exports = (app) => {

  app.locals.prettyDate = function(date) {
    return moment(date).format("YYYY-MM-DD HH:mm")
  }
}

