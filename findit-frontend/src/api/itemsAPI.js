import api from './axiosInstance'

const multipartConfig = {
  headers: { 'Content-Type': 'multipart/form-data' },
}

export const createLostItem = (data) =>
  api.post('/items/lost', data, multipartConfig)

export const createFoundItem = (data) =>
  api.post('/items/found', data, multipartConfig)

export const getItem = (id) =>
  api.get(`/items/${id}`)

export const updateItem = (id, data) =>
  api.put(`/items/${id}`, data)

export const resolveItem = (id) =>
  api.put(`/items/${id}/resolve`)

export const getMyItems = () =>
  api.get('/items/my')
