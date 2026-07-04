export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type AuthTokens = {
  access_token: string
  refresh_token: string
  token_type: string
}
