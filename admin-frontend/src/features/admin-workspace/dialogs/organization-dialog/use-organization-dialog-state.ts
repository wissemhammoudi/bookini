import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { UseFormReset, UseFormSetValue, UseFormWatch } from 'react-hook-form'

import { uploadImageRequest } from '@/lib/api'
import type { OrganizationFormValues } from '@/features/admin-workspace/dialogs/shared'

type UseOrganizationDialogStateParams = {
  setValue: UseFormSetValue<OrganizationFormValues>
  watch: UseFormWatch<OrganizationFormValues>
  reset: UseFormReset<OrganizationFormValues>
  onClose: () => void
}

export function useOrganizationDialogState({ setValue, watch, reset, onClose }: UseOrganizationDialogStateParams) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const logoValue = watch('logo')
  const coverValue = watch('cover_image')

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploadingLogo(true)
    setUploadError(null)
    try {
      const response = await uploadImageRequest(file)
      setValue('logo', response.url)
    } catch (err) {
      const typedError = err as { response?: { data?: { message?: string } }; message?: string }
      setUploadError(typedError.response?.data?.message || typedError.message || 'Failed to upload logo image')
    } finally {
      setIsUploadingLogo(false)
      event.target.value = ''
    }
  }

  const handleCoverUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploadingCover(true)
    setUploadError(null)
    try {
      const response = await uploadImageRequest(file)
      setValue('cover_image', response.url)
    } catch (err) {
      const typedError = err as { response?: { data?: { message?: string } }; message?: string }
      setUploadError(typedError.response?.data?.message || typedError.message || 'Failed to upload cover image')
    } finally {
      setIsUploadingCover(false)
      event.target.value = ''
    }
  }

  const handleClose = () => {
    reset()
    setUploadError(null)
    onClose()
  }

  return {
    isUploadingLogo,
    isUploadingCover,
    uploadError,
    logoValue,
    coverValue,
    handleLogoUpload,
    handleCoverUpload,
    handleClose,
  }
}
