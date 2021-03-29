const express = require('express')
const router = express.Router()
const db = require('../db')
const { validateSkillsForm, validationResult} = require('../validations')
const controller = require('../controllers')

router.get('/', (req, res, next) => {
  if(!req.session.auth) {
    return res.redirect('/login')
  }

  res.render('pages/admin', { title: 'Admin page', msgfile: req.flash('product')[0], msgskill: req.flash('skill')[0]})
})

router.post('/skills', ...validateSkillsForm(), (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors.array())
    if(!errors.isEmpty()) {
      req.flash('skill', 'Please fill out all fields')
  
      return res.redirect('/admin')
    }
    
    const data = req.body

    db.updateSkill(data)
 
    req.flash('skill', 'Skills has been added!')
    res.redirect('/admin')
})

// router.post('/upload', ...validateUploadForm(), (req, res, next) => {
//   /* TODO:
//    Реализовать сохранения объекта товара на стороне сервера с картинкой товара и описанием
//     в переменной photo - Картинка товара
//     в переменной name - Название товара
//     в переменной price - Цена товара
//     На текущий момент эта информация хранится в файле data.json  в массиве products
//   */
//     const errors = validationResult(req);
//     console.log(errors.array())
//     if(!errors.isEmpty()) {
//       req.flash('product', 'Please fill out all fields')
  
//       return res.redirect('/admin')
//     }
    
//     const upload = path.join('./public/assets/img', 'upload')

//     if (!fs.existsSync(upload)) {
//       fs.mkdirSync(upload)
//     }

//     db.add('products', {
//       photo: req.body.photo,
//       price: req.body.price,
//       name: req.body.name,
//     })
  
//     req.flash('product', 'Product has been added!')
//     res.redirect('/admin')
// })

router.post('/upload', controller.post) 
module.exports = router
