import { useEffect, useState } from 'react'
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
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null)
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)

  const logoValue = watch('logo')
  const coverValue = watch('cover_image')
  const logoDisplayValue = logoPreviewUrl ?? logoValue
  const coverDisplayValue = coverPreviewUrl ?? coverValue

  useEffect(
    () => () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl)
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl)
    },
    [logoPreviewUrl, coverPreviewUrl],
  )

  const clearLogoPendingFile = () => {
    setPendingLogoFile(null)
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl)
      setLogoPreviewUrl(null)
    }
  }

  const clearCoverPendingFile = () => {
    setPendingCoverFile(null)
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl)
      setCoverPreviewUrl(null)
    }
  }

  const validateImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed'
    }

    const maxBytes = 8 * 1024 * 1024
    if (file.size > maxBytes) {
      return 'Image size must be under 8MB'
    }

    return null
  }

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setUploadError(validationError)
      event.target.value = ''
      return
    }

    clearLogoPendingFile()
    setUploadError(null)

    setPendingLogoFile(file)
    setLogoPreviewUrl(URL.createObjectURL(file))
    event.target.value = ''
  }

  const handleCoverUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setUploadError(validationError)
      event.target.value = ''
      return
    }

    clearCoverPendingFile()
    setUploadError(null)

    setPendingCoverFile(file)
    setCoverPreviewUrl(URL.createObjectURL(file))
    event.target.value = ''
  }

  const clearLogo = () => {
    clearLogoPendingFile()
    setValue('logo', '')
  }

  const clearCover = () => {
    clearCoverPendingFile()
    setValue('cover_image', '')
  }

  const uploadPendingImagesIfNeeded = async (formValues: OrganizationFormValues): Promise<OrganizationFormValues> => {
    const nextValues: OrganizationFormValues = { ...formValues }

    if (pendingLogoFile) {
      setIsUploadingLogo(true)
      try {
        const response = await uploadImageRequest(pendingLogoFile)
        nextValues.logo = response.url
      } catch (err) {
        const typedError = err as { response?: { data?: { message?: string } }; message?: string }
        setUploadError(typedError.response?.data?.message || typedError.message || 'Failed to upload logo image')
        throw err
      } finally {
        setIsUploadingLogo(false)
      }
    }

    if (pendingCoverFile) {
      setIsUploadingCover(true)
      try {
        const response = await uploadImageRequest(pendingCoverFile)
        nextValues.cover_image = response.url
      } catch (err) {
        const typedError = err as { response?: { data?: { message?: string } }; message?: string }
        setUploadError(typedError.response?.data?.message || typedError.message || 'Failed to upload cover image')
        throw err
      } finally {
        setIsUploadingCover(false)
      }
    }

    return nextValues
  }

  const handleSubmitWithImageUploads = async (formValues: OrganizationFormValues): Promise<OrganizationFormValues> => {
    setUploadError(null)
    try {
      const nextValues = await uploadPendingImagesIfNeeded(formValues)
      clearLogoPendingFile()
      clearCoverPendingFile()
      return nextValues
    } catch {
      throw new Error('Image upload failed')
    }
  }

  const handleClose = () => {
    reset()
    setUploadError(null)
    clearLogoPendingFile()
    clearCoverPendingFile()
    onClose()
  }

  return {
    isUploadingLogo,
    isUploadingCover,
    uploadError,
    logoValue: logoDisplayValue,
    coverValue: coverDisplayValue,
    hasPendingLogo: Boolean(pendingLogoFile),
    hasPendingCover: Boolean(pendingCoverFile),
    handleLogoUpload,
    handleCoverUpload,
    clearLogo,
    clearCover,
    handleSubmitWithImageUploads,
    handleClose,
  }
}
