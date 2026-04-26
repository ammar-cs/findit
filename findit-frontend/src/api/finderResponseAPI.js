import api from './axiosInstance'

export const sendFinderMessage = (itemId, message) =>
  api.post('/finder-responses', { itemId, message })

export const getFinderResponse = (id) =>
  api.get(`/finder-responses/${id}`)

export const getFinderResponseByItem = (itemId) =>
  api.get(`/finder-responses/by-item/${itemId}`)

export const acceptFinderResponse = (id, data) =>
  api.put(`/finder-responses/${id}/accept`, data)

export const declineFinderResponse = (id) =>
  api.put(`/finder-responses/${id}/decline`)

export const markAsReturned = (id) =>
  api.put(`/finder-responses/${id}/returned`)

export const completeFinderResponse = (id) =>
  api.put(`/finder-responses/${id}/complete`)
