import api from './axiosInstance'

export const getActivity = () =>
  api.get('/history/activity')

export const archiveReport = (id) =>
  api.put(`/history/${id}/archive`)

export const getClaimHistory = () =>
  api.get('/history/claims')
