const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function signup(userData) {
  const { name, username, email, password, role } = userData

  const existingEmail = await User.findOne({ email })
  if (existingEmail) throw new Error('Email already in use')

  const existingUsername = await User.findOne({ username })
  if (existingUsername) throw new Error('Username already taken')

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = new User({
    name,
    username,
    email,
    password: hashedPassword,
    role: role || 'user',
  })

  const savedUser = await user.save()

  // Return user without password
  const { password: _pw, ...userWithoutPassword } = savedUser.toObject()
  return userWithoutPassword
}

async function signin(email, password) {
  const user = await User.findOne({ email })
  if (!user) throw new Error('Invalid credentials')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error('Invalid credentials')

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )

  return {
    token,
    user: {
      id:       user._id,
      username: user.username,
      name:     user.name,
      email:    user.email,
      role:     user.role,
    },
  }
}

module.exports = { signup, signin }
