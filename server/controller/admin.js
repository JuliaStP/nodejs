const db = require('../database')
const { serializeUser } = require('../scripts/serialize')

module.exports.getUser = async (req, res) => {
  const users = await db.getUser();
  res.json(users.map((user) => serializeUser(user)))
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const user = await db.updateUserPermission(req.params.id, req.body)
    res.json({
      ...serializeUser(user),
    });
  } catch (e) {
    next(e)
  }
};

module.exports.removeUser = async (req, res) => {
  await db.deleteUser(req.params.id)
  res.json({})
};