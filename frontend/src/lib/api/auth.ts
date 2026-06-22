import { apiClient } from '../api-client'
import type { ApiResponse, AuthTokens } from './common-types'

export const loginRequest = async (payload: {
  email: string
  password: string
}) => {
  const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', payload)
  return response.data.data
}

export const registerRequest = async (payload: {
  full_name: string
  email: string
  password: string
}) => {
  const response = await apiClient.post<ApiResponse<AuthTokens>>(
    '/auth/register',
    payload,
  )
  return response.data.data
}

export const changePasswordRequest = async (payload: {
  current_password: string
  new_password: string
}) => {
  await apiClient.post<ApiResponse<Record<string, never>>>(
    '/auth/change-password',
    payload,
  )
}

export const requestPasswordReset = async (payload: { email: string }) => {
  const response = await apiClient.post<ApiResponse<{ reset_token?: string }>>(
    '/auth/password-reset/request',
    payload,
  )
  return response.data.data
}

export const confirmPasswordReset = async (payload: {
  token: string
  new_password: string
}) => {
  const response = await apiClient.post<ApiResponse<Record<string, never>>>(
    '/auth/password-reset/confirm',
    payload,
  )
  return response.data.data
}

export const getProfileRequest = async () => {
  const response = await apiClient.get<ApiResponse<{ id: string; full_name: string; email: string; role: string; avatar_url: string | null }>>(
    '/auth/me',
  )
  return response.data.data
}

export const updateProfileRequest = async (payload: {
  full_name: string
  email: string
}) => {
  const response = await apiClient.put<ApiResponse<{ id: string; full_name: string; email: string; role: string; avatar_url: string | null }>>(
    '/auth/profile',
    payload,
  )
  return response.data.data
}

export const uploadAvatarRequest = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<ApiResponse<{ id: string; full_name: string; email: string; role: string; avatar_url: string | null }>>(
    '/auth/me/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return response.data.data
}
