import type { ReservationAreaRecord } from '@/lib/api-types'

export type ElementType = 'desk' | 'table' | 'chair' | 'projector' | 'plant' | 'door' | 'wall'

export type DeskZone = {
  name: string
  x: number
  y: number
  w: number
  h: number
  price: number
  includes: string[]
  type?: ElementType
  rotation?: number
  isReservable?: boolean
  image_urls?: string[]
}

export const asAreaRecord = (area: string | ReservationAreaRecord): ReservationAreaRecord => {
  if (typeof area === 'string') {
    return {
      name: area,
      price: 0,
      includes: [],
      is_reservable: true,
    }
  }

  return {
    name: area.name,
    price: area.price ?? 0,
    includes: area.includes ?? [],
    is_reservable: area.is_reservable !== false,
    geometry: area.geometry,
  }
}

export const parseBlueprintLayout = (blueprintImage?: string | null): DeskZone[] | null => {
  if (!blueprintImage) return null

  const source = blueprintImage.trim()
  if (!source.startsWith('[')) return null

  try {
    const parsed = JSON.parse(source)
    if (!Array.isArray(parsed)) return null

    const layout = parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && typeof item.name === 'string')
      .map((item) => ({
        name: String(item.name),
        x: Number(item.x ?? 0),
        y: Number(item.y ?? 0),
        w: Number(item.w ?? 90),
        h: Number(item.h ?? 60),
        price: Number(item.price ?? 0),
        includes: Array.isArray(item.includes)
          ? item.includes.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
          : [],
        type: (item.type as ElementType | undefined) ?? 'desk',
        rotation: Number(item.rotation ?? 0),
        isReservable: item.isReservable === false ? false : true,
        image_urls: Array.isArray(item.image_urls)
          ? item.image_urls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
          : [],
      }))

    return layout.length ? layout : null
  } catch {
    return null
  }
}
