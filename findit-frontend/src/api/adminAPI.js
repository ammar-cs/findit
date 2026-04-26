import api from './axiosInstance'

export const getReports = () =>
  api.get('/admin/reports')

export const removeReport = (id) =>
  api.put(`/admin/reports/${id}/remove`)

export const getAnalytics = () =>
  api.get('/admin/analytics')

export const promoteToAdmin = (email) =>
  api.put('/admin/promote', { email })
