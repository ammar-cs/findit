const { Schema, model } = require('mongoose')

/**
 * Tracks the full lifecycle when Account B says "I found your lost item"
 * and Account A responds with meetup details.
 *
 * Roles:
 *   posterId  — Account A (who posted the lost item)
 *   finderId  — Account B (who found it and sent the message)
 */
const FinderResponseSchema = new Schema({
  itemId:       { type: Schema.Types.ObjectId, ref: 'Item',         required: true },
  posterId:     { type: Schema.Types.ObjectId, ref: 'User',         required: true },
  finderId:     { type: Schema.Types.ObjectId, ref: 'User',         required: true },
  finderMessage:{ type: String, required: true },

  status: {
    type:    String,
    enum:    ['pending', 'accepted', 'declined', 'pending_confirmation', 'completed'],
    default: 'pending',
  },

  // Filled in by poster when they accept
  meetupLocation: { type: String },
  meetupTime:     { type: Date },
  meetupNotes:    { type: String },

  timeline: [
    {
      event:     { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
})

module.exports = model('FinderResponse', FinderResponseSchema)
