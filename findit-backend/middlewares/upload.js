const multer = require('multer')
const path = require('path')

// ── Disk storage configuration ────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  },
})

// ── Multer instances ──────────────────────────────────────────────────────────

/** Single image upload — field name: "image" */
const uploadSingle = multer({ storage }).single('image')

/** Multiple file upload — field name: "files", max 10 */
const uploadMultiple = multer({ storage }).array('files', 10)

// ── Error handler middleware ──────────────────────────────────────────────────

/**
 * Express error-handling middleware for multer errors.
 * Must be registered AFTER the route that uses multer.
 */
function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message })
  }
  if (err) {
    return res.status(400).json({ message: err.message || 'File upload error' })
  }
  next()
}

module.exports = { uploadSingle, uploadMultiple, handleUploadError }
