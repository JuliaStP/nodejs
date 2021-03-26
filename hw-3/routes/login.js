const express = require('express')
const router = express.Router()
const { validateLoginForm, validationResult} = require('../validations')

router.get('/', (req, res, next) => {
  if(req.session.auth) {
    return res.redirect('/admin')
  }

  res.render('pages/login', {
    title: 'Sign in page',
    msglogin: req.flash('login')[0]
  })
})

router.post('/', ...validateLoginForm(), (req, res, next) => {
  const errors = validationResult(req);

  if(errors.isEmpty()) {
    req.session.auth = true

    return res.redirect('/admin')
  }

  console.log(errors.array())
  req.flash('login', 'Invalid login or password')
  res.redirect('/login')
})

module.exports = router
