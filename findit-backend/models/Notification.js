const { Schema, model } = require('mongoose')

const NotificationSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['match_found', 'claim_approved', 'claim_rejected', 'reminder', 'admin_alert', 'found_your_item', 'meetup_accepted', 'meetup_declined', 'meetup_confirmed'], required: true },
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  isRead:    { type: Boolean, default: false },
  relatedId: { type: Schema.Types.ObjectId },
  // For found_your_item notifications — who sent it
  senderId:  { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
})

module.exports = model('Notification', NotificationSchema)
