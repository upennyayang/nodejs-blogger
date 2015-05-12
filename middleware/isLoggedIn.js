module.exports = (req, res, next) => {
  if (req.isAuthenticated()) return next()
  res.render('error.ejs', {
    message: "In order to view the page, ",
    login: true
  })
}
