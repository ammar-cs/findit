import api from './axiosInstance'

export const submitClaim = (data) =>
  api.post('/claims', data)

export const getClaim = (id) =>
  api.get(`/claims/${id}`)

export const approveClaim = (id) =>
  api.put(`/claims/${id}/approve`)

export const rejectClaim = (id) =>
  api.put(`/claims/${id}/reject`)

export const completeClaim = (id) =>
  api.put(`/claims/${id}/complete`)
