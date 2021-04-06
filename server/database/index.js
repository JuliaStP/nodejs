const User = require('./schemas/user')
const News = require('./schemas/news')
const { serializeNews } = require("../scripts/serialize")

module.exports.getUserByName = async (userName) => {
  return User.findOne({ userName })
}

module.exports.getUserById = async (id) => {
  return User.findById({ _id: id })
}

module.exports.createUser = async (data) => {
  const { username, surName, firstName, middleName, password } = data
  const newUser = new User({
    firstName,
    middleName,
    surName,
    image: null,
    userName: username,
    permission: {
      chat: { C: true, R: true, U: true, D: true },
      news: { C: true, R: true, U: true, D: true },
      settings: { C: true, R: true, U: true, D: true }
    },
  })
  newUser.setPassword(password)

  const user = await newUser.save()

  return user
}

//news

module.exports.getNews = async () => {
  const news = await News.find()
  return news.map((news) => serializeNews(news))
}

module.exports.createNews = async (data, user) => {
  const { title, text } = data
  let date = new Date()
  const news = new News({
    title,
    text,
    created_at: date.toUTCString(),
    user,
  })
  return await news.save()
}

module.exports.updateNews = async (id, data) => {
  return await News.findByIdAndUpdate({ _id: id }, { $set: data })
}

module.exports.deleteNews = async (id) => {
  return News.findByIdAndRemove({ _id: id })
}

//admin

module.exports.getUser = async () => {
  return User.find()
}

module.exports.updateUserPermission = async (id, data) => {
  return await User.findByIdAndUpdate(
    { _id: id },
    { $set: data },
    { new: true },
  )
}
module.exports.deleteUser = async (id) => {
  return User.findByIdAndRemove({ _id: id })
}