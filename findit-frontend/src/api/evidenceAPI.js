import api from './axiosInstance'

const multipartConfig = {
  headers: { 'Content-Type': 'multipart/form-data' },
}

export const uploadEvidence = (claimId, data) =>
  api.post(`/evidence/${claimId}`, data, multipartConfig)

export const getEvidence = (claimId) =>
  api.get(`/evidence/${claimId}`)
