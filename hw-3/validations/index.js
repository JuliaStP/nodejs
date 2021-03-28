const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const db = require('../db')

const validateMainForm = () => {
  return [
    body('name').not().isEmpty(),
    body('email').not().isEmpty(),
    body('message').not().isEmpty()
  ]
}

const validateLoginForm = () => {
  let user = null

  return [
    body('email').custom((value) => {
      user = db.getUserByEmail(value)
      console.log(user)
      if(value !== user.email) {
        throw new Error('Invalid Login');
      }

      return true
    }),
    body('password').custom((value) => {
      const hash = crypto.pbkdf2Sync(value, user.salt, 100000, 64, 'sha512')

      console.log(hash.toString('hex'))

      if (hash.toString('hex') !== user.hash) {
        throw new Error('Invalid Password')
      }

      return true
    })
  ]
}

const validateSkillsForm = () => {
  return [
    body('age').not().isEmpty(),
    body('concerts').not().isEmpty(),
    body('cities').not().isEmpty(),
    body('years').not().isEmpty()
  ]
}

const validateUploadForm = () => {
  return [
    body('src').not().isEmpty(),
    body('name').not().isEmpty(),
    body('price').not().isEmpty()
  ]
}

module.exports = {
  validateMainForm,
  validateLoginForm,
  validateSkillsForm,
  validateUploadForm,
  validationResult
}