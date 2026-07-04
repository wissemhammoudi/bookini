import type { DeskZone } from '@/features/admin-workspace/sections/floor-builder/floor-layout-utils'
import type { FloorRecord } from '@/lib/api-types'

export const toUniqueAreaNames = (value: string) => {
  const seen = new Set<string>()
  const ordered: string[] = []
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((name) => {
      if (!seen.has(name)) {
        seen.add(name)
        ordered.push(name)
      }
    })
  return ordered
}

export const normalizeRoomName = (base: string, used: Set<string>) => {
  const trimmed = base.trim()
  const root = trimmed || 'Room'
  if (!used.has(root)) {
    used.add(root)
    return root
  }

  let idx = 2
  while (used.has(`${root} ${idx}`)) {
    idx += 1
  }
  const next = `${root} ${idx}`
  used.add(next)
  return next
}

export const buildDesksFromFloor = (targetFloor?: FloorRecord, fallbackPrice = 0): DeskZone[] => {
  const blueprintImage = targetFloor?.blueprint_image
  if (blueprintImage) {
    const source = blueprintImage.trim()
    if (source.startsWith('[')) {
      try {
        const parsed = JSON.parse(source)
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
            .filter((item) => typeof item.name === 'string' && item.name.trim().length > 0)
            .map((item) => ({
              name: String(item.name),
              x: Number(item.x ?? 0),
              y: Number(item.y ?? 0),
              w: Number(item.w ?? 90),
              h: Number(item.h ?? 60),
              price: Number(item.price ?? fallbackPrice),
              includes: Array.isArray(item.includes)
                ? item.includes.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
                : [],
              type: typeof item.type === 'string' ? (item.type as DeskZone['type']) : 'desk',
              rotation: Number(item.rotation ?? 0),
              isReservable: item.isReservable === false ? false : true,
              image_urls: Array.isArray(item.image_urls)
                ? item.image_urls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
                : [],
            }))
        }
      } catch {
        // Ignore malformed blueprint JSON and rely on reservation areas.
      }
    }
  }

  return (targetFloor?.reservation_areas ?? []).map((area, idx) => {
    const areaRecord =
      typeof area === 'string'
        ? {
            name: area,
            price: fallbackPrice,
            includes: [] as string[],
            is_reservable: true,
            geometry: undefined,
          }
        : {
            ...area,
            price: area.price ?? fallbackPrice,
            includes: area.includes ?? [],
            is_reservable: area.is_reservable !== false,
          }

    return {
      name: areaRecord.name,
      x: areaRecord.geometry?.x ?? 20 + (idx % 4) * 110,
      y: areaRecord.geometry?.y ?? 20 + Math.floor(idx / 4) * 80,
      w: areaRecord.geometry?.w ?? 90,
      h: areaRecord.geometry?.h ?? 60,
      price: areaRecord.price ?? fallbackPrice,
      includes: areaRecord.includes ?? [],
      type: (areaRecord.geometry?.type as DeskZone['type'] | undefined) ?? 'desk',
      rotation: areaRecord.geometry?.rotation ?? 0,
      isReservable: areaRecord.is_reservable !== false,
      image_urls: [],
    }
  })
}

export const deriveReservationAreasFromDesks = (desks: DeskZone[], fallbackPrice: number) => {
  const reservableDesks = desks
    .filter((desk) => desk.isReservable !== false)
    .slice()
    .sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y
      return a.x - b.x
    })

  const used = new Set<string>()
  return reservableDesks.map((desk, index) => ({
    name: normalizeRoomName(desk.name || `Room ${index + 1}`, used),
    price: Number(desk.price ?? fallbackPrice),
    includes: Array.isArray(desk.includes) ? desk.includes.filter(Boolean) : [],
    is_reservable: desk.isReservable !== false,
    geometry: {
      x: desk.x,
      y: desk.y,
      w: desk.w,
      h: desk.h,
      rotation: desk.rotation,
      type: desk.type,
    },
  }))
}
