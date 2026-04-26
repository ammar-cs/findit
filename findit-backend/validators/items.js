const { check } = require('express-validator')

const validateCreateItem = [
  check('title')
    .notEmpty()
    .withMessage('Title is required'),

  check('type')
    .isIn(['lost', 'found'])
    .withMessage('Type must be lost or found'),

  check('category')
    .notEmpty()
    .withMessage('Category is required'),

  check('description')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),

  check('date')
    .notEmpty()
    .withMessage('Date is required'),

  check('location')
    .notEmpty()
    .withMessage('Location is required'),
]

module.exports = { validateCreateItem }
