const passport = require('passport')
const passportJWT = require('passport-jwt')
const LocalStrategy = require('passport-local').Strategy
const { getUserByName, getUserById } = require('../database')

const Strategy = passportJWT.Strategy
const params = {
  secretOrKey: 'loft',
  jwtFromRequest: function (req) {
    let token = null

    if (req && req.headers) {
      token = req.headers['authorization']
    }

    return token
  }
}

//LocalStrategy
passport.use(
  new LocalStrategy(async function (username, password, done) {
    try {
      var user = await getUserByName(username)
    } catch (error) {
        return done(error)
    }

    if (!user) {
      return done(null, false)
    }

    if (!user.validPassword(password)) {
      return done(null, false)
    }

    done(null, user)
  })
)

//JWT Strategy
passport.use(
  new Strategy(params, async function (payload, done) {
    try {
      var user = await getUserById(payload.user.id)
    } catch (error) {
        return done(error)
    }

    if (!user) {
      return done(new Error('User not found'))
    }

    done(null, user)
  })
)

module.exports.authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (!user || err) {
      return res.status(401).json({
        // code: 401,
        message: 'You did not authorize!'
      })
    }

    req.user = user

    next()
  })(req, res, next)
}  

module.exports.authorization = (req, res, next) => {
  passport.authenticate ('local', { session: false }, 
    async (err, user) => {
      if (err) {
        return next(err)
      }
  
      if (user) {
        req.user = user
      } else {
        return res.status(400).json({
          // code: 400,
          message: 'You did not authorize! Please try again'
        })
      }
  
      next()
    }
  )(req, res, next)
} 