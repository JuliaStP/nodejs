const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const nconf = require('nconf')

module.exports = function () {
  return nconf
    .argv()
    .env()
    .file({ file: path.join(__dirname, 'data.json') })
}
 
const adapter = new FileSync(path.resolve(__dirname, '../data.json'))
const db = low(adapter)

const get = (name) => {
  return db.get(name).value()
}

const add = (name, data) => {
  if (db.has(name).value()) {
    return db.get(name).push(data).write()
  }

  db.set(name, []).write()
  db.get(name).push(data).write()
}

const getUserByEmail = (email) => {
  return db.get('users').find({ email }).value()
}

const updateSkill = (data) => {

  Object.keys(data).forEach((item, i) => {
      if (data[item]) {
          db.get(`skills[${i}]`)
              .set('number', data[item])
              .write()
      }
  });
}

module.exports = {
  get,
  add,
  getUserByEmail,
  updateSkill
};