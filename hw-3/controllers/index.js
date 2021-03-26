const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const db = require('../db')


module.exports.post = (req, res, next) => {
  const form = new formidable.IncomingForm()
  const upload = path.join('./public', 'upload')

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload)
  }

  form.uploadDir = path.join(process.cwd(), upload)

  form.parse(req, function (err, fields, files) {
    if (err) {
      return next(err)
    }

    const valid = validation(fields, files)

    if (valid.err) {
      fs.unlinkSync(files.photo.path)
      return res.redirect('/admin')
    }

    const fileName = path.join(upload, files.photo.name)

    fs.rename(files.photo.path, fileName, function (err) {
      if (err) {
        console.error(err.message)
        return
      }

      db.add('products', {
        photo: files.photo.name,
        name: fields.name,
        price: fields.price
      })
      
      req.flash('product', 'Product has been added!')
      res.redirect('/admin')
    })
  })
}

const validation = (fields, files) => {
  if (files.photo.name === '' || files.photo.size === 0) {
    return { status: 'Photo has not been uploaded', err: true }
  }
  if (!fields.name) {
    return { status: 'All fields must be filled', err: true }
  }
  if (!fields.price) {
    return { status: 'All fields must be filled', err: true }
  }
  return { status: 'Ok', err: false }
}