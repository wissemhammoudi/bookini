import { apiClient } from './api-client'
import type { ApiResponse, AuthTokens, CurrentUserProfile } from './api-types'
import { unwrap } from './api-utils'

export const loginRequest = async (payload: { email: string; password: string }) => {
  const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', payload)
  return unwrap(response.data)
}

export const getCurrentUserProfile = async () => {
  const response = await apiClient.get<ApiResponse<CurrentUserProfile>>('/auth/me')
  return unwrap(response.data)
}

export const registerRequest = async (payload: {
  full_name: string
  email: string
  password: string
}) => {
  const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/register', payload)
  return unwrap(response.data)
}

export const changePasswordRequest = async (payload: {
  current_password: string
  new_password: string
}) => {
  await apiClient.post<ApiResponse<Record<string, never>>>('/auth/change-password', payload)
}

export const uploadImageRequest = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<ApiResponse<{ url: string }>>('/auth/upload', formData, {
    timeout: 60000,
    headers: {
      'Content-Type': undefined,
    },
  })
  return unwrap(response.data)
}
