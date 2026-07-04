export const getErrorMessage = (error: unknown): string => {
  const axiosLike = error as {
    response?: {
      data?: {
        message?: string
        detail?: string
        errors?: Array<{ msg?: string; detail?: string }>
      }
    }
  }

  const firstError = axiosLike.response?.data?.errors?.[0]
  const backendDetail = firstError?.detail ?? firstError?.msg

  if (backendDetail) {
    return backendDetail
  }

  if (axiosLike.response?.data?.detail) {
    return axiosLike.response.data.detail
  }

  if (axiosLike.response?.data?.message) {
    return axiosLike.response.data.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
