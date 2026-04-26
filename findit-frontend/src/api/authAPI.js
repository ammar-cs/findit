import api from './axiosInstance'

export const signup = (data) =>
  api.post('/auth/signup', data)

export const login = (data) =>
  api.post('/auth/signin', data)
