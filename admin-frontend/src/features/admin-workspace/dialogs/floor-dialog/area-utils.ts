import type { ReservationAreaRecord } from '@/lib/api-types'

import { normalizeRoomName, toUniqueAreaNames } from '@/features/admin-workspace/dialogs/shared'

export type UpdateReservationArea = <K extends keyof ReservationAreaRecord>(
  index: number,
  key: K,
  areaValue: ReservationAreaRecord[K],
) => void

export const buildInitialReservationAreas = (
  areas: Array<string | ReservationAreaRecord> | undefined,
  fallbackPrice: number,
): ReservationAreaRecord[] =>
  (areas ?? []).map((area) =>
    typeof area === 'string'
      ? {
          name: area,
          price: fallbackPrice,
          includes: [],
          is_reservable: true,
        }
      : {
          ...area,
          price: area.price ?? fallbackPrice,
          includes: area.includes ?? [],
          is_reservable: area.is_reservable !== false,
        },
  )

export const syncReservationAreasText = (
  areas: ReservationAreaRecord[],
  updater: (next: string) => void,
) => {
  updater(areas.map((area) => area.name).join(', '))
}

export const buildReservationAreasFromInput = (
  rawValue: string,
  existingAreas: ReservationAreaRecord[],
  fallbackPrice: number,
) => {
  const names = toUniqueAreaNames(rawValue)
  const currentByName = new Map(existingAreas.map((area) => [area.name, area]))

  return names.map((name) => {
    const existing = currentByName.get(name)
    if (existing) {
      return { ...existing, name }
    }

    return {
      name,
      price: fallbackPrice,
      includes: [],
      is_reservable: true,
    }
  })
}

export const extractUniqueAreasFromBlueprint = (rawBlueprint: string, fallbackPrice: number) => {
  const parsed = JSON.parse(rawBlueprint)
  if (!Array.isArray(parsed)) {
    throw new Error('Blueprint must be a JSON array of layout elements.')
  }

  const extractedAreas = parsed
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .filter((item) => item.isReservable !== false)
    .map((item, index) => ({
      name: String(item.name ?? `Room ${index + 1}`).trim(),
      price: Number(item.price ?? fallbackPrice),
      includes: Array.isArray(item.includes)
        ? item.includes.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
        : [],
      is_reservable: item.isReservable === false ? false : true,
      geometry: {
        x: typeof item.x === 'number' ? item.x : undefined,
        y: typeof item.y === 'number' ? item.y : undefined,
        w: typeof item.w === 'number' ? item.w : undefined,
        h: typeof item.h === 'number' ? item.h : undefined,
        rotation: typeof item.rotation === 'number' ? item.rotation : undefined,
        type: typeof item.type === 'string' ? item.type : undefined,
      },
    }))

  const uniqueAreaMap = new Map<string, ReservationAreaRecord>()
  const usedNames = new Set<string>()
  extractedAreas.forEach((area, index) => {
    const defaultName = area.name || `Room ${index + 1}`
    const normalizedName = normalizeRoomName(defaultName, usedNames)
    uniqueAreaMap.set(normalizedName, {
      ...area,
      name: normalizedName,
    })
  })

  return Array.from(uniqueAreaMap.values())
}
