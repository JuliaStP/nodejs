const { prompt, password } = require('promptly')
const signale = require('signale')
const crypto = require('crypto')
const db = require('./db')

const validatorEmail = (value) => {
  const req = /^((([0-9A-Za-z]{1}[-0-9A-z\.]{1,}[0-9A-Za-z]{1})|([0-9А-Яа-я]{1}[-0-9А-я\.]{1,}[0-9А-Яа-я]{1}))@([-A-Za-z]{1,}\.){1,2}[-A-Za-z]{2,})$/u

  if(req.test(value)) {
    return value
  } else {
    signale.error('Invalid email')
    throw new Error();
  }
}

const validatorPassword = (value) => {
  if(value.length < 8) {
    signale.error('Password can not be less than 8 symbols')
    throw new Error();
  }

  return value
}

const askForPasswords = async () => {
  const inputPassword = await password('Input password:', {
    replace: '*',
    validator:validatorPassword
  })
  const repeatPassword = await password('Repeat password:', {
    replace: '*',
    validator:validatorPassword
  })

  if (inputPassword === repeatPassword) {
    return inputPassword
  } else {
    signale.error('Passwords do not match!')
    return askForPasswords()
  }
}

const registerUser = async (email, password) => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  db.add('users', {
    email,
    salt,
    hash
  })

  signale.success(`Successful registration for user: ${email}`)
}

(async function main() {
  const email = await prompt('Please input user email:', {
    validator: validatorEmail
  })

  const isContainEmail = db.getUserByEmail(email) ? true : false

  if(isContainEmail) {
    signale.error(`This User Email is already exist`)
    main()
  } else {
    const password = await askForPasswords()

    registerUser(email.trim(), password.trim())
  }
})()