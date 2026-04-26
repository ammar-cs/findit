const { Schema, model } = require('mongoose')

const EvidenceSchema = new Schema({
  claimId:    { type: Schema.Types.ObjectId, ref: 'Claim', required: true },
  claimantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  files: [
    {
      filename:   { type: String },
      url:        { type: String },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  reviewed:  { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

module.exports = model('Evidence', EvidenceSchema)
