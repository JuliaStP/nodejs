const db = require('../database')
const { serializeUser } = require('../scripts/serialize')
const secret = process.env.SECRET
const tokens = require('../auth/token')


module.exports.getNews = async (req, res, next) => {
  try {
      const news = await db.getNews()
   return res.json(news)
  } catch (e) {
      next(e)
  }   
}

module.exports.postNews = async (req, res, next) => {
  try {
      const token = req.headers['authorization']
      const user = await tokens.getUserByToken(token, db, secret)
      await db.createNews(req.body, serializeUser(user))
      const news = await db.getNews()
      res.json(news)
  } catch (e) {
      next(e)
  }
}

module.exports.updateNews = async (req, res, next) => {
  try {
      await db.updateNews(req.params.id, req.body)
      const news = await db.getNews()
      res.json(news)
  } catch (e) {
      next(e)
  }
}

module.exports.removeNews = async (req, res, next) => {
  try {
      await db.deleteNews(req.params.id)
      const news = await db.getNews()
      res.json(news)
  } catch (e) {
      next(e)
  }
}