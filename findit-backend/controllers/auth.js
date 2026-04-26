const { validationResult } = require('express-validator')
const authService = require('../services/auth')

async function postSignup(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg })
  }

  try {
    const user = await authService.signup(req.body)
    return res.status(201).json({ message: 'User created successfully', user })
  } catch (error) {
    if (error.message.includes('already')) {
      return res.status(409).json({ message: error.message })
    }
    return res.status(500).json({ message: error.message })
  }
}

async function postSignin(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg })
  }

  try {
    const { token, user } = await authService.signin(req.body.email, req.body.password)
    return res.status(200).json({ token, user })
  } catch (error) {
    if (error.message.includes('Invalid credentials')) {
      return res.status(401).json({ message: error.message })
    }
    return res.status(500).json({ message: error.message })
  }
}

module.exports = { postSignup, postSignin }
