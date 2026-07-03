import { useEffect, useState } from 'react'

import { uploadImageRequest } from '@/lib/api'
import { TOOLBOX_TEMPLATES } from '@/features/admin-workspace/sections/floor-builder/floor-layout-visuals'
import { asAreaRecord, parseBlueprintLayout } from '@/features/admin-workspace/sections/floor-builder/floor-layout-utils'
import type { DeskZone } from '@/features/admin-workspace/sections/floor-builder/floor-layout-utils'
import type { FloorRecord } from '@/lib/api-types'

type UseFloorBuilderStateParams = {
  floor: FloorRecord
  desksState?: DeskZone[]
  onDesksStateChange?: (desks: DeskZone[]) => void
}

export function useFloorBuilderState({ floor, desksState, onDesksStateChange }: UseFloorBuilderStateParams) {
  const [isUploadingRoomImages, setIsUploadingRoomImages] = useState(false)
  const [roomImageError, setRoomImageError] = useState<string | null>(null)
  const [pendingImageFilesByUrl, setPendingImageFilesByUrl] = useState<Record<string, File>>({})

  const [internalDesks, setInternalDesks] = useState<DeskZone[]>(() => {
    const parsedLayout = parseBlueprintLayout(floor.blueprint_image)
    if (parsedLayout) return parsedLayout

    return (floor.reservation_areas ?? []).map((area, idx) => ({
      name: asAreaRecord(area).name,
      x: asAreaRecord(area).geometry?.x ?? 20 + (idx % 4) * 110,
      y: asAreaRecord(area).geometry?.y ?? 20 + Math.floor(idx / 4) * 80,
      w: asAreaRecord(area).geometry?.w ?? 90,
      h: asAreaRecord(area).geometry?.h ?? 60,
      price: asAreaRecord(area).price,
      includes: asAreaRecord(area).includes,
      type: 'desk',
      rotation: asAreaRecord(area).geometry?.rotation ?? 0,
      isReservable: asAreaRecord(area).is_reservable,
      image_urls: [],
    }))
  })

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const desks = desksState ?? internalDesks
  const selectedDesk = selectedIndex !== null ? desks[selectedIndex] : null

  useEffect(
    () => () => {
      Object.keys(pendingImageFilesByUrl).forEach((url) => URL.revokeObjectURL(url))
    },
    [pendingImageFilesByUrl],
  )

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

  const setDesks = (updater: DeskZone[] | ((prev: DeskZone[]) => DeskZone[])) => {
    const next = typeof updater === 'function' ? (updater as (prev: DeskZone[]) => DeskZone[])(desks) : updater
    if (onDesksStateChange) {
      onDesksStateChange(next)
      return
    }
    setInternalDesks(next)
  }

  const handleUpdateSelected = <K extends keyof DeskZone>(field: K, value: DeskZone[K]) => {
    if (selectedIndex === null) return
    setDesks((prev) => {
      const updated = [...prev]
      updated[selectedIndex] = { ...updated[selectedIndex], [field]: value }
      return updated
    })
  }

  const handleUploadSelectedRoomImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (selectedIndex === null || !files || files.length === 0) return

    const nextPendingUrls: string[] = []
    const nextPendingEntries: Record<string, File> = {}

    for (const file of Array.from(files)) {
      const validationError = validateImageFile(file)
      if (validationError) {
        nextPendingUrls.forEach((url) => URL.revokeObjectURL(url))
        setRoomImageError(validationError)
        event.target.value = ''
        return
      }

      const previewUrl = URL.createObjectURL(file)
      nextPendingUrls.push(previewUrl)
      nextPendingEntries[previewUrl] = file
    }

    setRoomImageError(null)
    setPendingImageFilesByUrl((previous) => ({ ...previous, ...nextPendingEntries }))

    const existing = selectedDesk?.image_urls ?? []
    const merged = Array.from(new Set([...existing, ...nextPendingUrls]))
    handleUpdateSelected('image_urls', merged)

    event.target.value = ''
  }

  const handleRemoveRoomImage = (targetIndex: number) => {
    if (!selectedDesk) return

    const targetImageUrl = (selectedDesk.image_urls ?? [])[targetIndex]
    if (targetImageUrl && pendingImageFilesByUrl[targetImageUrl]) {
      URL.revokeObjectURL(targetImageUrl)
      setPendingImageFilesByUrl((previous) => {
        const next = { ...previous }
        delete next[targetImageUrl]
        return next
      })
    }

    const nextImages = (selectedDesk.image_urls ?? []).filter((_, index) => index !== targetIndex)
    handleUpdateSelected('image_urls', nextImages)
  }

  const handleAddTemplate = (template: (typeof TOOLBOX_TEMPLATES)[number]) => {
    const count = desks.filter((desk) => desk.name.startsWith(template.label)).length + 1
    const newElement: DeskZone = {
      name: `${template.label} ${count}`,
      x: 180,
      y: 180,
      w: template.w,
      h: template.h,
      price: floor.pricing,
      includes: [],
      type: template.type,
      rotation: 0,
      isReservable: template.isReservable,
    }

    setDesks((prev) => [...prev, newElement])
    setSelectedIndex(desks.length)
  }

  const handleDeleteDesk = (index: number) => {
    const imageUrls = desks[index]?.image_urls ?? []
    imageUrls.forEach((url) => {
      if (!pendingImageFilesByUrl[url]) return
      URL.revokeObjectURL(url)
      setPendingImageFilesByUrl((previous) => {
        const next = { ...previous }
        delete next[url]
        return next
      })
    })

    setDesks((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
    setSelectedIndex(null)
  }

  const resolvePendingRoomImageUploads = async (): Promise<DeskZone[]> => {
    const pendingEntries = Object.entries(pendingImageFilesByUrl)
    if (pendingEntries.length === 0) {
      return desks
    }

    setIsUploadingRoomImages(true)
    setRoomImageError(null)
    try {
      const uploadedPairs = await Promise.all(
        pendingEntries.map(async ([previewUrl, file]) => {
          const response = await uploadImageRequest(file)
          return [previewUrl, response.url] as const
        }),
      )

      const uploadedByPreviewUrl = Object.fromEntries(uploadedPairs)
      const nextDesks = desks.map((desk) => {
        if (!desk.image_urls || desk.image_urls.length === 0) {
          return desk
        }

        return {
          ...desk,
          image_urls: desk.image_urls.map((url) => uploadedByPreviewUrl[url] ?? url),
        }
      })

      pendingEntries.forEach(([previewUrl]) => URL.revokeObjectURL(previewUrl))
      setPendingImageFilesByUrl({})
      return nextDesks
    } catch (error) {
      const uploadError = error as { response?: { data?: { message?: string } }; message?: string }
      setRoomImageError(uploadError.response?.data?.message || uploadError.message || 'Failed to upload room images')
      throw new Error('Room images upload failed', { cause: error })
    } finally {
      setIsUploadingRoomImages(false)
    }
  }

  const handleRotateSelected = () => {
    if (selectedIndex === null) return
    setDesks((prev) => {
      const updated = [...prev]
      const currentRotation = updated[selectedIndex].rotation || 0
      updated[selectedIndex] = { ...updated[selectedIndex], rotation: (currentRotation + 90) % 360 }
      return updated
    })
  }

  const handleSelectDesk = (event: React.MouseEvent, index: number) => {
    event.preventDefault()
    setSelectedIndex(index)
    const desk = desks[index]
    const startX = event.clientX
    const startY = event.clientY
    const originalX = desk.x
    const originalY = desk.y

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      setDesks((prev) => {
        const updated = [...prev]
        const nextX = Math.max(0, Math.min(500 - desk.w, Math.round((originalX + dx) / 10) * 10))
        const nextY = Math.max(0, Math.min(500 - desk.h, Math.round((originalY + dy) / 10) * 10))
        updated[index] = { ...updated[index], x: nextX, y: nextY }
        return updated
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleResizeDesk = (event: React.MouseEvent, index: number) => {
    event.preventDefault()
    event.stopPropagation()
    const desk = desks[index]
    const startX = event.clientX
    const startY = event.clientY
    const originalW = desk.w
    const originalH = desk.h

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      setDesks((prev) => {
        const updated = [...prev]
        const nextW = Math.max(20, Math.min(500 - desk.x, Math.round((originalW + dx) / 10) * 10))
        const nextH = Math.max(20, Math.min(500 - desk.y, Math.round((originalH + dy) / 10) * 10))
        updated[index] = { ...updated[index], w: nextW, h: nextH }
        return updated
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return {
    desks,
    selectedDesk,
    selectedIndex,
    isUploadingRoomImages,
    roomImageError,
    pendingSelectedRoomImagesCount: (selectedDesk?.image_urls ?? []).filter((url) => Boolean(pendingImageFilesByUrl[url])).length,
    handleAddTemplate,
    handleDeleteDesk,
    handleRemoveRoomImage,
    handleResizeDesk,
    handleRotateSelected,
    handleSelectDesk,
    handleUpdateSelected,
    handleUploadSelectedRoomImages,
    resolvePendingRoomImageUploads,
  }
}
