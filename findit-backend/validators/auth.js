const { check } = require('express-validator')

const validateSignup = [
  check('name')
    .notEmpty()
    .withMessage('Name is required'),

  check('username')
    .notEmpty()
    .withMessage('Username is required'),

  check('email')
    .isEmail()
    .withMessage('Invalid email format'),

  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  check('role')
    .optional()
    .isIn(['user', 'finder'])
    .withMessage('Invalid role'),
]

const validateSignin = [
  check('email')
    .isEmail()
    .withMessage('Invalid email'),

  check('password')
    .notEmpty()
    .withMessage('Password is required'),
]

module.exports = { validateSignup, validateSignin }
