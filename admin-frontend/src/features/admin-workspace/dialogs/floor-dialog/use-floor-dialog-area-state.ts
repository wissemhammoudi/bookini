import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form'

import { deriveReservationAreasFromDesks, normalizeRoomName } from '@/features/admin-workspace/dialogs/shared'
import {
  buildReservationAreasFromInput,
  extractUniqueAreasFromBlueprint,
  syncReservationAreasText,
} from '@/features/admin-workspace/dialogs/floor-dialog/area-utils'
import type { FloorFormValues } from '@/features/admin-workspace/dialogs/shared'
import type { DeskZone } from '@/features/admin-workspace/sections/floor-builder/floor-layout-utils'
import type { ReservationAreaRecord } from '@/lib/api-types'

type UseFloorDialogAreaStateParams = {
  initialAreas: ReservationAreaRecord[]
  setBuilderDesks: Dispatch<SetStateAction<DeskZone[]>>
  getValues: UseFormGetValues<FloorFormValues>
  setValue: UseFormSetValue<FloorFormValues>
}

export function useFloorDialogAreaState({
  initialAreas,
  setBuilderDesks,
  getValues,
  setValue,
}: UseFloorDialogAreaStateParams) {
  const [extractedReservationAreas, setExtractedReservationAreas] = useState<ReservationAreaRecord[]>(initialAreas)

  const handleReservationAreasInputChange = (nextValue: string) => {
    setValue('reservation_areas', nextValue, { shouldDirty: true, shouldValidate: true })
    const nextAreas = buildReservationAreasFromInput(nextValue, extractedReservationAreas, getValues('pricing') ?? 0)
    setExtractedReservationAreas(nextAreas)
  }

  const updateReservationArea = <K extends keyof ReservationAreaRecord>(index: number, key: K, areaValue: ReservationAreaRecord[K]) => {
    setExtractedReservationAreas((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: areaValue }

      if (key === 'name') {
        const used = new Set(next.filter((_, idx) => idx !== index).map((area) => area.name))
        next[index] = { ...next[index], name: normalizeRoomName(String(areaValue ?? ''), used) }
      }

      syncReservationAreasText(next, (names) => {
        setValue('reservation_areas', names, { shouldDirty: true, shouldValidate: true })
      })

      setBuilderDesks((prevDesks) => {
        let areaCursor = -1
        return prevDesks.map((desk) => {
          if (desk.isReservable === false) return desk
          areaCursor += 1
          const syncedArea = next[areaCursor]
          if (!syncedArea) return desk

          return {
            ...desk,
            name: syncedArea.name,
            price: syncedArea.price ?? desk.price,
            includes: syncedArea.includes ?? [],
            isReservable: syncedArea.is_reservable !== false,
          }
        })
      })

      return next
    })
  }

  const addReservationArea = () => {
    setExtractedReservationAreas((prev) => {
      const used = new Set(prev.map((area) => area.name))
      const newName = normalizeRoomName(`Room ${prev.length + 1}`, used)
      const next = [...prev, { name: newName, price: getValues('pricing') ?? 0, includes: [], is_reservable: true }]
      syncReservationAreasText(next, (names) => {
        setValue('reservation_areas', names, { shouldDirty: true, shouldValidate: true })
      })
      return next
    })
  }

  const removeReservationArea = (index: number) => {
    setExtractedReservationAreas((prev) => {
      const next = prev.filter((_, idx) => idx !== index)
      syncReservationAreasText(next, (names) => {
        setValue('reservation_areas', names, { shouldDirty: true, shouldValidate: true })
      })
      return next
    })
  }

  const syncFromBuilderDesks = (desks: DeskZone[]) => {
    const areas = deriveReservationAreasFromDesks(desks, Number(getValues('pricing') ?? 0))
    setExtractedReservationAreas(areas)
    syncReservationAreasText(areas, (names) => {
      setValue('reservation_areas', names, { shouldDirty: true, shouldValidate: true })
    })
  }

  const extractReservationAreasFromBlueprint = (): string | null => {
    const rawBlueprint = getValues('blueprint_image')?.trim()
    if (!rawBlueprint) {
      return 'Paste floor layout JSON first, then extract reservation areas.'
    }

    try {
      const uniqueAreas = extractUniqueAreasFromBlueprint(rawBlueprint, Number(getValues('pricing') ?? 0))
      if (!uniqueAreas.length) {
        return 'No reservable areas found in blueprint JSON.'
      }

      setExtractedReservationAreas(uniqueAreas)
      setBuilderDesks((prevDesks) => {
        if (!prevDesks.length) {
          return uniqueAreas.map((area, idx) => ({
            name: area.name,
            x: area.geometry?.x ?? 20 + (idx % 4) * 110,
            y: area.geometry?.y ?? 20 + Math.floor(idx / 4) * 80,
            w: area.geometry?.w ?? 90,
            h: area.geometry?.h ?? 60,
            price: area.price ?? Number(getValues('pricing') ?? 0),
            includes: area.includes ?? [],
            type: area.geometry?.type as DeskZone['type'] | undefined,
            rotation: area.geometry?.rotation ?? 0,
            isReservable: area.is_reservable !== false,
            image_urls: [],
          }))
        }

        let cursor = -1
        return prevDesks.map((desk) => {
          if (desk.isReservable === false) return desk
          cursor += 1
          const synced = uniqueAreas[cursor]
          if (!synced) return desk
          return {
            ...desk,
            name: synced.name,
            price: synced.price ?? desk.price,
            includes: synced.includes ?? [],
            isReservable: synced.is_reservable !== false,
          }
        })
      })

      setValue('reservation_areas', uniqueAreas.map((area) => area.name).join(', '), {
        shouldDirty: true,
        shouldValidate: true,
      })
      return null
    } catch {
      return 'Invalid blueprint JSON. Paste a valid JSON layout array.'
    }
  }

  return {
    extractedReservationAreas,
    setExtractedReservationAreas,
    handleReservationAreasInputChange,
    updateReservationArea,
    addReservationArea,
    removeReservationArea,
    syncFromBuilderDesks,
    extractReservationAreasFromBlueprint,
  }
}
