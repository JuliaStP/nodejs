const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const db = require('../db')
const { validateUploadForm, validationResult} = require('../validations')


module.exports.post = (req, res, next) => {
  const form = new formidable.IncomingForm()
  const upload = path.join('./public', 'upload')

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload)
  }

  form.uploadDir = path.join(process.cwd(), upload)

  form.parse(req, function (errors, fields, files) {
    if (errors) {
      return next(errors)
    }

    const valid = validateUploadForm(fields, files)

    if (valid.errors) {
      fs.unlinkSync(files.photo.path)

      return valid.error
    }

    const fileName = path.join(upload, files.photo.name)

    try { 
      fs.rename(files.photo.path, fileName, function (errors) {
        // if (valid.errors) {
        //   fs.unlinkSync(files.photo.path)
    
        //   return valid.error
        // }

        errors = validationResult(req);
        console.log(errors.array())
        if(!errors.isEmpty()) {
          req.flash('skill', 'Please fill out all fields')
      
          return res.redirect('/admin')
        }
  
        const dir = fileName.substr(fileName.indexOf('\\')).replace(/(\\\\|\\)/g, '/');
  
        db.add('products', {
          src: dir,
          name: fields.name,
          price: fields.price
        })
        
        req.flash('product', 'Product has been added!')
        res.redirect('/admin')
      })
    } catch(error) {
      req.flash('skill', 'Please fill out all fields')
      
      return res.redirect('/admin')
    }
  })
}

// const validation = (fields, files) => {
//   if (files.photo.name === '' || files.photo.size === 0) {
//     return  { error: new Error('All fields must be filled') }
//   }
//   if (!fields.name) {
//     return { error: new Error('All fields must be filled') }
//   }
//   if (!fields.price) {
//     return { error: new Error('All fields must be filled') }
//   }
//   return { status: 'Ok', err: false }
// }