export const ACCESS_TOKEN_KEY = 'bookiwa7dek_admin_access_token'
export const REFRESH_TOKEN_KEY = 'bookiwa7dek_admin_refresh_token'

export const getStoredAccessToken = () =>
  window.localStorage.getItem(ACCESS_TOKEN_KEY)

export const getStoredRefreshToken = () =>
  window.localStorage.getItem(REFRESH_TOKEN_KEY)

export const setStoredTokens = (accessToken: string, refreshToken: string) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export const clearStoredTokens = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}
