const express = require('express')
const router = express.Router()
const { validateSignup, validateSignin } = require('../validators/auth')
const authController = require('../controllers/auth')

// POST /api/auth/signup
router.post('/signup', validateSignup, authController.postSignup)

// POST /api/auth/signin
router.post('/signin', validateSignin, authController.postSignin)

module.exports = router
