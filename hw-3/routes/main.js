const express = require('express')
const router = express.Router()
const db = require('../db')
const { validateMainForm, validationResult} = require('../validations')

router.get('/', (req, res, next) => {
  const skills = db.get('skills')
  const products = db.get('products')
  res.render('pages/index', { title: 'Main page', products, skills, msgemail: req.flash('message')[0]})
})

router.post('/', ...validateMainForm(), (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors.array())
  if(!errors.isEmpty()) {
    req.flash('message', 'Please fill out all fields')

    return res.redirect('/')
  }

  db.add('messages', {
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  })

  req.flash('message', 'Message has been sent!')
  res.redirect('/')
})

module.exports = router
