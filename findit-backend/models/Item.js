const { Schema, model } = require('mongoose')

const ItemSchema = new Schema({
  title:       { type: String, required: true },
  type:        { type: String, enum: ['lost', 'found'], required: true },
  category:    { type: String, required: true },
  description: { type: String, required: true },
  date:        { type: Date, required: true },
  location:    { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  imageUrl:    { type: String },
  status:      { type: String, enum: ['active', 'resolved', 'archived'], default: 'active' },
  claimInProgress: { type: Boolean, default: false },
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  flagged:     { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now },
})

module.exports = model('Item', ItemSchema)
