const { Schema, model } = require('mongoose')

const ClaimSchema = new Schema({
  itemId:        { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  claimantId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  finderId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description:   { type: String, required: true },
  uniqueDetails: { type: String },
  status:        { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  evidenceFiles: [{ type: String }],
  timeline: [
    {
      event:     { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
})

module.exports = model('Claim', ClaimSchema)
