import api from './axiosInstance'

export const searchItems = (params) =>
  api.get('/items/search', { params })

export const getMatches = (id) =>
  api.get(`/items/${id}/matches`)

export const getNearby = (lat, lng, radius) =>
  api.get('/items/nearby', { params: { lat, lng, radius } })
