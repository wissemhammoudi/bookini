export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export type FloorRoomPreview = {
  name: string
  price: number
  includes: string[]
  image_urls: string[]
  isReservable: boolean
}

export type BookingType = 'WHOLE_FLOOR' | 'SELECTED_AREAS'

export const toIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const timeToMinutes = (value: string) => {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

export const overlaps = (startA: string, endA: string, startB: string, endB: string) => {
  const aStart = timeToMinutes(startA)
  const aEnd = timeToMinutes(endA)
  const bStart = timeToMinutes(startB)
  const bEnd = timeToMinutes(endB)
  return aStart < bEnd && aEnd > bStart
}

export const parseFloorRoomPreviews = (
  blueprintImage: string | null | undefined,
  reservationAreas:
    | Array<
        | string
        | {
            name: string
            price?: number
            includes?: string[]
            is_reservable?: boolean
          }
      >
    | undefined,
  fallbackPrice: number,
) => {
  const previewMap = new Map<string, FloorRoomPreview>()

  if (blueprintImage) {
    const source = blueprintImage.trim()
    if (source.startsWith('[')) {
      try {
        const parsed = JSON.parse(source)
        if (Array.isArray(parsed)) {
          parsed
            .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
            .filter((item) => typeof item.name === 'string')
            .forEach((item) => {
              const preview: FloorRoomPreview = {
                name: String(item.name),
                price: Number(item.price ?? fallbackPrice),
                includes: Array.isArray(item.includes)
                  ? item.includes.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
                  : [],
                image_urls: Array.isArray(item.image_urls)
                  ? item.image_urls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
                  : [],
                isReservable: item.isReservable === false ? false : true,
              }
              previewMap.set(preview.name, preview)
            })
        }
      } catch {
        // Ignore blueprint JSON issues
      }
    }
  }

  ;(reservationAreas ?? []).forEach((area) => {
    if (typeof area === 'string') {
      if (!previewMap.has(area)) {
        previewMap.set(area, {
          name: area,
          price: fallbackPrice,
          includes: [],
          image_urls: [],
          isReservable: true,
        })
      }
      return
    }

    if (!area || typeof area !== 'object' || typeof area.name !== 'string') {
      return
    }

    const existing = previewMap.get(area.name)
    const includes = Array.isArray(area.includes)
      ? area.includes.filter((entry: unknown): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      : []

    if (existing) {
      previewMap.set(area.name, {
        ...existing,
        price: Number(area.price ?? existing.price ?? fallbackPrice),
        includes: existing.includes.length ? existing.includes : includes,
        isReservable: area.is_reservable === false ? false : existing.isReservable,
      })
    } else {
      previewMap.set(area.name, {
        name: area.name,
        price: Number(area.price ?? fallbackPrice),
        includes,
        image_urls: [],
        isReservable: area.is_reservable === false ? false : true,
      })
    }
  })

  return Array.from(previewMap.values()).filter((item) => item.isReservable)
}

export const formatShape = (shape: string | undefined) => {
  if (!shape) return 'N/A'
  return shape.toLowerCase().replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

type CalendarSlot = {
  booking_date: string
  start_time: string
  end_time: string
  status: string
}

export const groupReservedByDate = (slots: CalendarSlot[]) => {
  return slots.reduce<Record<string, Array<{ start: string; end: string; status: string }>>>((acc, slot) => {
    if (!acc[slot.booking_date]) {
      acc[slot.booking_date] = []
    }
    acc[slot.booking_date].push({
      start: slot.start_time,
      end: slot.end_time,
      status: slot.status,
    })
    return acc
  }, {})
}

export const buildCalendarDayCells = (
  calendarMonth: Date,
  calendarStart: Date,
  calendarEnd: Date,
) => {
  const firstWeekday = (calendarStart.getDay() + 6) % 7
  const daysInMonth = calendarEnd.getDate()
  const dayCells: Array<Date | null> = []

  for (let i = 0; i < firstWeekday; i += 1) {
    dayCells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    dayCells.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day))
  }

  return dayCells
}
