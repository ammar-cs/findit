const { check } = require('express-validator')

const validateSubmitClaim = [
  check('itemId')
    .notEmpty()
    .withMessage('Item ID is required'),

  check('description')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),

  check('uniqueDetails')
    .optional()
    .notEmpty(),
]

module.exports = { validateSubmitClaim }
