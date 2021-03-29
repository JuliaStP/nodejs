const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const db = require('../db')


const validation = (fields, files, dir) => {
  if (dir === '') {
    return  { errors: new Error('All fields must be filled - photo'), err: null }
  }
  if (fields.name === '') {
    return { errors: new Error('All fields must be filled - name'), err: null }
  }
  if (fields.price === '') {
    return { errors: new Error('All fields must be filled - price'), err: null }
  }
  return { status: 'Ok', err: false }
}

module.exports.post = (req, res, next) => {
  const form = new formidable.IncomingForm()
  const upload = path.join('./public', 'upload')

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload)
  }

  form.uploadDir = path.join(process.cwd(), upload)

  form.parse(req, function (errors, fields, files) {
    if (errors) {
      return next(new Error('Can not upload your file'), null)
    }

    const valid = validation(fields, files)

    if (valid.errors) {
      fs.unlinkSync(files.src.path)

      return next(valid.errors, null)
    }

    const fileName = path.join(upload, files.src.name)

    try { 
      fs.rename(files.src.path, fileName, function (errors) {
        if (errors) {
          return next(new Error('Can not upload your file'), null)
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
    } catch(errors) {
      return next(new Error('Can not upload your file'), null)
    }
  })
}

