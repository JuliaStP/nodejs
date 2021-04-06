const express = require('express');
const router = express.Router();
const { authenticate, authorization } = require('../auth/passport')

const { registration, login, getProfile, updateProfile, refreshToken } = require('../controller/user')
const { getNews, postNews, updateNews, removeNews } = require('../controller/news')
const { getUser, updateUser, removeUser } = require('../controller/admin')

router.post('/registration', registration)
router.post('/login', authorization, login)
router.post('/refresh-token', refreshToken)

router.get('/profile', authenticate, getProfile)
router.patch('/profile', authenticate, updateProfile)

router.get('/news', authenticate, getNews)
router.post('/news', authenticate, postNews)
router.patch('/news/:id', authenticate, updateNews)
router.delete('/news/:id', authenticate, removeNews)

router.get('/users', authenticate, getUser)
router.patch('/users/:id/permission', authenticate, updateUser)
router.delete('/users/:id', authenticate, removeUser)

module.exports = router;