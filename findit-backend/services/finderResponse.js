const FinderResponse = require('../models/FinderResponse')
const Item           = require('../models/Item')
const notificationsService = require('./notifications')

async function createFinderResponse(itemId, finderId, finderUsername, finderMessage) {
  const item = await Item.findById(itemId)
  if (!item) throw new Error('Item not found')
  if (item.type !== 'lost') throw new Error('Can only respond to lost items')
  if (item.userId.toString() === finderId) throw new Error('Cannot contact yourself')
  if (item.status === 'resolved') throw new Error('Item is already resolved')

  // Prevent duplicate pending responses from the same finder
  const existing = await FinderResponse.findOne({ itemId, finderId, status: 'pending' })
  if (existing) throw new Error('You already sent a message for this item')

  const response = new FinderResponse({
    itemId,
    posterId:      item.userId,
    finderId,
    finderMessage,
    timeline: [{ event: 'Finder sent a message' }],
  })
  await response.save()

  // Notify the poster
  await notificationsService.createNotification({
    userId:    item.userId,
    type:      'found_your_item',
    title:     `${finderUsername} may have found your item!`,
    message:   finderMessage || `${finderUsername} thinks they found your lost item "${item.title}".`,
    relatedId: response._id,
    senderId:  finderId,
  })

  return response
}

async function getFinderResponse(responseId, userId) {
  const response = await FinderResponse
    .findById(responseId)
    .populate('itemId')
    .populate('posterId', 'name username email')
    .populate('finderId', 'name username email')

  if (!response) throw new Error('Not found')

  const isPoster = response.posterId._id.toString() === userId
  const isFinder = response.finderId._id.toString() === userId
  if (!isPoster && !isFinder) throw new Error('Unauthorized')

  return response
}

async function getFinderResponseByItem(itemId, userId) {
  // Find the most recent response for this item where the user is poster or finder
  const response = await FinderResponse
    .findOne({
      itemId,
      $or: [{ posterId: userId }, { finderId: userId }],
    })
    .sort({ createdAt: -1 })
    .populate('itemId')
    .populate('posterId', 'name username email')
    .populate('finderId', 'name username email')

  if (!response) throw new Error('Not found')
  return response
}

async function acceptResponse(responseId, userId, meetupLocation, meetupTime, meetupNotes) {
  const response = await FinderResponse.findById(responseId)
  if (!response) throw new Error('Not found')
  if (response.posterId.toString() !== userId) throw new Error('Unauthorized')
  if (response.status !== 'pending') throw new Error('Already processed')

  if (!meetupLocation || !meetupTime) throw new Error('Meetup location and time are required')

  response.status         = 'accepted'
  response.meetupLocation = meetupLocation
  response.meetupTime     = new Date(meetupTime)
  response.meetupNotes    = meetupNotes || ''
  response.timeline.push({ event: 'Poster accepted — meetup arranged' })
  await response.save()

  // Notify the finder
  const item = await Item.findById(response.itemId)
  await notificationsService.createNotification({
    userId:    response.finderId,
    type:      'meetup_accepted',
    title:     'Your message was accepted!',
    message:   `The owner wants to meet you to collect "${item?.title}". Check the meetup details.`,
    relatedId: response._id,
  })

  return response
}

async function declineResponse(responseId, userId) {
  const response = await FinderResponse.findById(responseId)
  if (!response) throw new Error('Not found')
  if (response.posterId.toString() !== userId) throw new Error('Unauthorized')
  if (response.status !== 'pending') throw new Error('Already processed')

  response.status = 'declined'
  response.timeline.push({ event: 'Poster declined' })
  await response.save()

  const item = await Item.findById(response.itemId)
  await notificationsService.createNotification({
    userId:    response.finderId,
    type:      'meetup_declined',
    title:     'Your message was declined',
    message:   `The owner of "${item?.title}" declined your message.`,
    relatedId: response._id,
  })

  return response
}

async function markAsReturned(responseId, userId) {
  const response = await FinderResponse.findById(responseId)
  if (!response) throw new Error('Not found')
  if (response.finderId.toString() !== userId) throw new Error('Unauthorized')
  if (response.status !== 'accepted') throw new Error('Can only mark as returned an accepted response')

  response.status = 'pending_confirmation'
  response.timeline.push({ event: 'Finder marked item as returned - awaiting owner confirmation' })
  await response.save()

  // Notify the poster to confirm
  const item = await Item.findById(response.itemId)
  await notificationsService.createNotification({
    userId:    response.posterId,
    type:      'awaiting_confirmation',
    title:     'Confirm you received your item!',
    message:   `${response.finderId.name || response.finderId.username} marked "${item?.title}" as returned. Please confirm you received it.`,
    relatedId: response._id,
    senderId:  response.finderId,
  })

  return response
}

async function completeResponse(responseId, userId) {
  const response = await FinderResponse.findById(responseId)
  if (!response) throw new Error('Not found')
  if (response.posterId.toString() !== userId) throw new Error('Only the item owner can confirm receipt')
  if (response.status !== 'pending_confirmation') throw new Error('Cannot confirm - item not marked as returned')

  response.status = 'completed'
  response.timeline.push({ event: 'Owner confirmed receipt - transaction completed' })
  await response.save()

  await Item.findByIdAndUpdate(response.itemId, { status: 'resolved' })

  // Notify the finder that the transaction is complete
  const item = await Item.findById(response.itemId)
  await notificationsService.createNotification({
    userId:    response.finderId,
    type:      'transaction_complete',
    title:     'Transaction completed!',
    message:   `The owner confirmed receiving "${item?.title}". Thank you for your help!`,
    relatedId: response._id,
    senderId:  response.posterId,
  })

  return response
}

module.exports = { createFinderResponse, getFinderResponse, getFinderResponseByItem, acceptResponse, declineResponse, markAsReturned, completeResponse }
