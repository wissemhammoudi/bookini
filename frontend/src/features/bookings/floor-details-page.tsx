import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  Container,
  Divider,
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Rating,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import ShapeLineIcon from '@mui/icons-material/ShapeLine'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useNavigate, useParams } from 'react-router-dom'

import { useColorMode } from '@/app/use-color-mode'
import { PublicFooter } from '@/features/public/components/public-footer'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import { BookingDialog } from './components/BookingDialog'
import type { BookingFormData } from './types'
import {
  createPublicBookingRequest,
  listPublicBookingCalendarSlots,
  listPublicRooms,
  deleteMyFloorReview,
  listFloorReviews,
  upsertMyFloorReview,
} from '@/lib/api'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const toIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const timeToMinutes = (value: string) => {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

const overlaps = (startA: string, endA: string, startB: string, endB: string) => {
  const aStart = timeToMinutes(startA)
  const aEnd = timeToMinutes(endA)
  const bStart = timeToMinutes(startB)
  const bEnd = timeToMinutes(endB)
  return aStart < bEnd && aEnd > bStart
}

type FloorRoomPreview = {
  name: string
  price: number
  includes: string[]
  image_urls: string[]
  isReservable: boolean
}

type BookingType = 'WHOLE_FLOOR' | 'SELECTED_AREAS'

const parseFloorRoomPreviews = (
  blueprintImage: string | null | undefined,
  reservationAreas:
    | Array<
        | string
        | {
            name: string;
            price?: number;
            includes?: string[];
            is_reservable?: boolean;
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

export const FloorDetailsPage = () => {
  const navigate = useNavigate()
  const { roomId = '', floorId = '' } = useParams()
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  const [selectedPlan] = useState('pay-as-you-go')
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingType, setBookingType] = useState<BookingType>('WHOLE_FLOOR')
  const [selectedAreaKeys, setSelectedAreaKeys] = useState<string[]>([])
  const [selectedAreaDetails, setSelectedAreaDetails] = useState<FloorRoomPreview | null>(null)

  const [floorRating, setFloorRating] = useState(5)
  const [floorComment, setFloorComment] = useState('')
  const [floorReviewsPage, setFloorReviewsPage] = useState(0)
  const [floorReviewsMinFilter, setFloorReviewsMinFilter] = useState(0)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  const roomsQuery = useQuery({
    queryKey: ['public-rooms-catalog'],
    queryFn: listPublicRooms,
  })

  const room = useMemo(() => {
    return (roomsQuery.data ?? []).find((item) => item.id === Number.parseInt(roomId, 10)) ?? null
  }, [roomsQuery.data, roomId])

  const floor = useMemo(() => {
    if (!room?.floors) return null
    return room.floors.find((f) => f.id === floorId) ?? null
  }, [room, floorId])

  const floorPrice = floor?.price ?? room?.price ?? 0
  const floorRoomPreviews = useMemo(
    () => parseFloorRoomPreviews(floor?.blueprint_image, floor?.reservation_areas, floorPrice),
    [floor?.blueprint_image, floor?.reservation_areas, floorPrice],
  )
  const areaOptions = useMemo(
    () => floorRoomPreviews.map((item) => ({
      key: item.name,
      label: item.name,
      price: item.price,
      includes: item.includes,
      capacity: floor?.capacity,
    })),
    [floorRoomPreviews, floor?.capacity],
  )
  const resolvedSelectedAreaKeys = useMemo(
    () => selectedAreaKeys.filter((key) => areaOptions.some((option) => option.key === key)),
    [selectedAreaKeys, areaOptions],
  )
  const selectedAreaOptions = useMemo(
    () => areaOptions.filter((option) => resolvedSelectedAreaKeys.includes(option.key)),
    [areaOptions, resolvedSelectedAreaKeys],
  )
  const selectedAreasHourlyRate = selectedAreaOptions.reduce((sum, option) => sum + option.price, 0)
  const effectiveDisplayPrice = bookingType === 'SELECTED_AREAS' && selectedAreaOptions.length > 0
    ? selectedAreasHourlyRate
    : floorPrice

  const images = useMemo(() => {
    if (!room) return []
    const imageSeed = encodeURIComponent(room.name.toLowerCase().replace(/\s+/g, '-'))
    const fallback = [
      `https://picsum.photos/seed/${imageSeed}-1/1400/780`,
      `https://picsum.photos/seed/${imageSeed}-2/1200/700`,
      `https://picsum.photos/seed/${imageSeed}-3/1200/700`,
    ]
    const list = [floor?.blueprint_image, room.cover_image, ...(room.gallery ?? [])]
      .filter((item): item is string => typeof item === 'string' && !item.startsWith('['))
      .slice(0, 3)
    return list.length > 0 ? list : fallback;
  }, [room, floor])

  const createBookingMutation = useMutation({ mutationFn: createPublicBookingRequest })
  const floorReviewsLimit = 5

  const floorReviewsQuery = useQuery({
    queryKey: ['floor-reviews', floorId, floorReviewsPage, floorReviewsMinFilter],
    queryFn: () =>
      listFloorReviews(floorId, {
        limit: floorReviewsLimit,
        offset: floorReviewsPage * floorReviewsLimit,
        min_rating: floorReviewsMinFilter > 0 ? floorReviewsMinFilter : undefined,
      }),
    enabled: Boolean(floorId),
  })

  const upsertFloorReviewMutation = useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      upsertMyFloorReview(floorId, payload),
    onSuccess: async () => {
      await floorReviewsQuery.refetch()
      setFloorComment('')
      setFloorRating(5)
    },
  })

  const deleteFloorReviewMutation = useMutation({
    mutationFn: () => deleteMyFloorReview(floorId),
    onSuccess: async () => {
      await floorReviewsQuery.refetch()
    },
  })

  const calendarStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const calendarEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)

  const calendarSlotsQuery = useQuery({
    queryKey: [
      'public-booking-calendar-slots',
      room?.id,
      toIsoDate(calendarStart),
      toIsoDate(calendarEnd),
    ],
    queryFn: () =>
      listPublicBookingCalendarSlots({
        room_id: room!.id,
        start_date: toIsoDate(calendarStart),
        end_date: toIsoDate(calendarEnd),
      }),
    enabled: Boolean(room),
  })

  const reservedByDate = (calendarSlotsQuery.data ?? []).reduce<Record<string, Array<{ start: string; end: string; status: string }>>>((acc, slot) => {
    const key = slot.booking_date
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push({ start: slot.start_time, end: slot.end_time, status: slot.status })
    return acc
  }, {})

  const monthLabel = calendarMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const firstWeekday = (calendarStart.getDay() + 6) % 7
  const daysInMonth = calendarEnd.getDate()
  const dayCells: Array<Date | null> = []

  for (let i = 0; i < firstWeekday; i += 1) {
    dayCells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    dayCells.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day))
  }

  const handleCalendarDateClick = (date: Date) => {
    if (!room) return

    const iso = toIsoDate(date)
    const hasReservations = (reservedByDate[iso] ?? []).length > 0
    if (hasReservations) {
      setBookingError('This date is already reserved and cannot be booked. Please choose another date.')
      return
    }

    if (bookingType === 'SELECTED_AREAS' && resolvedSelectedAreaKeys.length === 0) {
      setBookingError('Select one or more areas from this floor before opening the booking form.')
      return
    }

    setSelectedCalendarDate(iso)
    setBookingError(null)
    setBookingDialogOpen(true)
  }

  const handleBookingSubmit = async (data: BookingFormData & { roomId: number; floorId?: string; roomKey?: string; bookingType?: BookingType; selectedAreaKeys?: string[]; roomName: string; planId: string; price: number }) => {
    setBookingError(null)

    try {
      const latestSlots = await listPublicBookingCalendarSlots({
        room_id: data.roomId,
        start_date: data.bookingDate,
        end_date: data.endDate || data.bookingDate,
      })

      const conflictingSlot = latestSlots.find((slot) =>
        overlaps(data.startTime, data.endTime, slot.start_time, slot.end_time),
      )
      if (conflictingSlot) {
        setBookingError(
          `This time is already reserved (${conflictingSlot.start_time} - ${conflictingSlot.end_time}). Please choose another slot.`,
        )
        return false
      }

      const created = await createBookingMutation.mutateAsync({
        room_id: data.roomId,
        floor_id: data.floorId,
        room_key: data.roomKey,
        booking_type: data.bookingType,
        selected_area_keys: data.selectedAreaKeys,
        room_name: data.roomName,
        plan_id: data.planId,
        guest_name: data.guestName,
        guest_email: data.guestEmail,
        guest_phone: data.guestPhone,
        booking_date: data.bookingDate,
        end_date: data.endDate || undefined,
        start_time: data.startTime,
        end_time: data.endTime,
        participants: Number.parseInt(data.participants, 10) || 1,
        notes: data.notes || undefined,
        price: data.price,
      })

      navigate(`/booking-confirmation/${created.booking_reference}`)
      return true
    } catch {
      setBookingError('Could not complete your booking. Please verify your details and try again.')
      return false
    }
  }

  const formatShape = (shape: string | undefined) => {
    if (!shape) return 'N/A'
    return shape.toLowerCase().replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  if (roomsQuery.isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar isLight={isLight} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="info">Loading floor details...</Alert>
        </Container>
        <PublicFooter isLight={isLight} />
      </Box>
    )
  }

  if (!room || !floor) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar isLight={isLight} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Stack spacing={2}>
            <Alert severity="error">Floor not found.</Alert>
            <Button variant="outlined" onClick={() => navigate('/book')}>Back to spaces</Button>
          </Stack>
        </Container>
        <PublicFooter isLight={isLight} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isLight
          ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #eef2ff 100%)'
          : 'linear-gradient(180deg, #0a0e1a 0%, #101d32 45%, #1a1f3a 100%)',
      }}
    >
      <PublicNavbar isLight={isLight} />

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack spacing={4}>
          <Stack direction="row" spacing={1} sx={{ alignSelf: 'flex-start' }}>
            <Button variant="outlined" onClick={() => navigate(`/book/place/${roomId}`)}>
              Back to place
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: isLight ? 'rgba(0, 89, 179, 0.1)' : 'rgba(255, 255, 255, 0.08)',
              background: isLight
                ? 'linear-gradient(120deg, #ffffff 0%, #f7fbff 100%)'
                : 'linear-gradient(120deg, rgba(16,29,50,0.88) 0%, rgba(10,14,26,0.9) 100%)',
            }}
          >
            <Stack spacing={2.5}>
              <Chip
                icon={<AspectRatioIcon />}
                label={`Floor ${floor.floor_number}`}
                color="primary"
                variant="outlined"
                sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
              />
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                {floor.floor_name}
              </Typography>
              <Typography color="text.secondary" variant="h6">
                Capacity {floor.capacity} people • €{effectiveDisplayPrice}/hour
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <AspectRatioIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Floor Size</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{floor.floor_size_sqm ?? 100} sqm</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <ShapeLineIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Floor Shape</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatShape(floor.floor_shape)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              {floor.description ? (
                <Typography color="text.secondary" sx={{ maxWidth: 760, mt: 1.5 }}>
                  {floor.description}
                </Typography>
              ) : null}

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip
                  label="Book Whole Floor"
                  color={bookingType === 'WHOLE_FLOOR' ? 'primary' : 'default'}
                  variant={bookingType === 'WHOLE_FLOOR' ? 'filled' : 'outlined'}
                  onClick={() => setBookingType('WHOLE_FLOOR')}
                />
                <Chip
                  label="Book Selected Areas"
                  color={bookingType === 'SELECTED_AREAS' ? 'secondary' : 'default'}
                  variant={bookingType === 'SELECTED_AREAS' ? 'filled' : 'outlined'}
                  onClick={() => setBookingType('SELECTED_AREAS')}
                />
                {bookingType === 'SELECTED_AREAS' ? (
                  <Chip
                    label={`${selectedAreaOptions.length} area${selectedAreaOptions.length === 1 ? '' : 's'} selected`}
                    variant="outlined"
                  />
                ) : null}
              </Stack>
            </Stack>
          </Paper>

          {floorRoomPreviews.length > 0 ? (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <MeetingRoomOutlinedIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Select Reservation Areas / Rooms
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                  }}
                >
                  {floorRoomPreviews.map((roomPreview, index) => (
                    <Paper
                      key={`${roomPreview.name}-${index}`}
                      variant="outlined"
                      onClick={() => {
                        if (bookingType !== 'SELECTED_AREAS') return
                        setSelectedAreaKeys((current) =>
                          current.includes(roomPreview.name)
                            ? current.filter((name) => name !== roomPreview.name)
                            : [...current, roomPreview.name],
                        )
                      }}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: bookingType === 'SELECTED_AREAS' ? 'pointer' : 'default',
                        borderColor: resolvedSelectedAreaKeys.includes(roomPreview.name) ? 'primary.main' : 'divider',
                        backgroundColor: resolvedSelectedAreaKeys.includes(roomPreview.name)
                          ? (isLight ? 'rgba(0, 89, 179, 0.06)' : 'rgba(0, 89, 179, 0.18)')
                          : undefined,
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                            {roomPreview.name}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<InfoOutlinedIcon fontSize="small" />}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedAreaDetails(roomPreview)
                              }}
                            >
                              Details
                            </Button>
                            {bookingType === 'SELECTED_AREAS' && (
                              <Chip
                                size="small"
                                label={resolvedSelectedAreaKeys.includes(roomPreview.name) ? 'Selected' : 'Select'}
                                color={resolvedSelectedAreaKeys.includes(roomPreview.name) ? 'primary' : 'default'}
                                variant={resolvedSelectedAreaKeys.includes(roomPreview.name) ? 'filled' : 'outlined'}
                              />
                            )}
                          </Stack>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          €{roomPreview.price}/hour
                        </Typography>
                        {roomPreview.includes.length > 0 ? (
                          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                            {roomPreview.includes.slice(0, 3).map((feature) => (
                              <Chip key={`${roomPreview.name}-${feature}`} size="small" label={feature} variant="outlined" />
                            ))}
                          </Stack>
                        ) : null}
                      </Stack>
                    </Paper>
                  ))}
                </Box>
              </Stack>
            </Paper>
          ) : null}

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <PhotoLibraryOutlinedIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Images
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                }}
              >
                <Box
                  component="img"
                  src={images[0]}
                  alt={`${floor.floor_name} main`}
                  sx={{ width: '100%', height: { xs: 220, md: 360 }, objectFit: 'cover', borderRadius: 2 }}
                />
                <Stack spacing={1.5}>
                  <Box
                    component="img"
                    src={images[1] || images[0]}
                    alt={`${floor.floor_name} secondary 1`}
                    sx={{ width: '100%', height: { xs: 140, md: 172 }, objectFit: 'cover', borderRadius: 2 }}
                  />
                  <Box
                    component="img"
                    src={images[2] || images[0]}
                    alt={`${floor.floor_name} secondary 2`}
                    sx={{ width: '100%', height: { xs: 140, md: 172 }, objectFit: 'cover', borderRadius: 2 }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 3 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              background: isLight ? '#ffffff' : 'rgba(10, 14, 26, 0.45)',
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Reservation Calendar
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Choose an available date to open the booking form. Reserved dates are disabled.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                    startIcon={<ArrowBackIosNewIcon fontSize="small" />}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                    endIcon={<ArrowForwardIosIcon fontSize="small" />}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>

              {bookingError ? <Alert severity="error">{bookingError}</Alert> : null}

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {monthLabel}
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gap: { xs: 0.5, sm: 1 },
                }}
              >
                {WEEK_DAYS.map((dayName) => (
                  <Box key={dayName} sx={{ py: 1, textAlign: 'center' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      }}
                      color="text.secondary"
                    >
                      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                        {dayName.charAt(0)}
                      </Box>
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {dayName}
                      </Box>
                    </Typography>
                  </Box>
                ))}

                {dayCells.map((day, index) => {
                  if (!day) {
                    return <Box key={`empty-${index}`} sx={{ height: { xs: 52, sm: 86 } }} />
                  }

                  const iso = toIsoDate(day)
                  const reservedSlots = reservedByDate[iso] ?? []
                  const isDisabled = reservedSlots.length > 0
                  const isSelected = selectedCalendarDate === iso

                  return (
                    <Button
                      key={iso}
                      variant={isSelected ? 'contained' : 'outlined'}
                      disabled={isDisabled}
                      onClick={() => handleCalendarDateClick(day)}
                      sx={{
                        height: { xs: 52, sm: 86 },
                        alignItems: { xs: 'center', sm: 'flex-start' },
                        justifyContent: { xs: 'center', sm: 'space-between' },
                        flexDirection: 'column',
                        p: { xs: 0.5, sm: 1 },
                        textTransform: 'none',
                        borderRadius: 2,
                        minWidth: 0,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {day.getDate()}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={isSelected ? 'inherit' : 'text.secondary'}
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                      >
                        {reservedSlots.length > 0 ? `${reservedSlots.length} reserved` : 'Available'}
                      </Typography>
                      {reservedSlots.length > 0 && (
                        <Box
                          sx={{
                            display: { xs: 'block', sm: 'none' },
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: isSelected ? 'common.white' : 'text.disabled',
                            mt: 0.5,
                          }}
                        />
                      )}
                    </Button>
                  )
                })}
              </Box>

              {selectedCalendarDate ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: isLight ? 'rgba(0, 89, 179, 0.22)' : 'rgba(255, 255, 255, 0.22)',
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Reserved slots for {selectedCalendarDate} ({floor.floor_name})
                    </Typography>

                    {(reservedByDate[selectedCalendarDate] ?? []).length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No reserved slots for this date. Click this date to open the request form.
                      </Typography>
                    ) : (
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {(reservedByDate[selectedCalendarDate] ?? []).map((slot, idx) => (
                          <Chip
                            key={`${selectedCalendarDate}-${idx}`}
                            label={`${slot.start} - ${slot.end}`}
                            size="small"
                            color={slot.status === 'CONFIRMED' ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              ) : null}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              background: isLight ? '#ffffff' : 'rgba(10, 14, 26, 0.45)',
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Ratings & Comments
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    See what people said about this floor and leave your own rating.
                  </Typography>
                </Box>
                <Stack spacing={0.5} sx={{ minWidth: 130 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average rating
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {floorReviewsQuery.data?.average_rating?.toFixed(1) ?? '0.0'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {floorReviewsQuery.data?.rating_count ?? 0} reviews
                  </Typography>
                </Stack>
              </Stack>

              {floorReviewsQuery.isError ? <Alert severity="error">Could not load ratings and comments right now.</Alert> : null}

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          Rate this floor
                        </Typography>
                        <Rating value={floorRating} onChange={(_, value) => setFloorRating(value ?? 5)} precision={1} />
                        <TextField
                          label="Comment"
                          value={floorComment}
                          onChange={(event) => setFloorComment(event.target.value)}
                          minRows={4}
                          multiline
                        />
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            disabled={upsertFloorReviewMutation.isPending}
                            onClick={() =>
                              upsertFloorReviewMutation.mutate({
                                rating: floorRating,
                                comment: floorComment.trim() || undefined,
                              })
                            }
                          >
                            Save rating
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            disabled={deleteFloorReviewMutation.isPending}
                            onClick={() => {
                              deleteFloorReviewMutation.mutate()
                            }}
                          >
                            Delete my rating
                          </Button>
                        </Stack>
                        {upsertFloorReviewMutation.isError || deleteFloorReviewMutation.isError ? (
                          <Alert severity="error">Failed to submit rating. Please try again.</Alert>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                        Recent comments
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
                        <TextField
                          select
                          label="Minimum rating"
                          size="small"
                          value={floorReviewsMinFilter}
                          onChange={(event) => {
                            setFloorReviewsPage(0)
                            setFloorReviewsMinFilter(Number(event.target.value))
                          }}
                          sx={{ width: { xs: '100%', sm: 180 } }}
                        >
                          <MenuItem value={0}>All</MenuItem>
                          <MenuItem value={5}>5 stars</MenuItem>
                          <MenuItem value={4}>4+ stars</MenuItem>
                          <MenuItem value={3}>3+ stars</MenuItem>
                          <MenuItem value={2}>2+ stars</MenuItem>
                          <MenuItem value={1}>1+ stars</MenuItem>
                        </TextField>
                      </Stack>

                      <Stack spacing={1.5}>
                        {(floorReviewsQuery.data?.reviews ?? []).map((review) => (
                          <Box key={review.id}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                              <Rating value={review.rating} precision={1} readOnly size="small" />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.created_at).toLocaleDateString()}
                              </Typography>
                            </Stack>
                            {review.comment ? (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {review.comment}
                              </Typography>
                            ) : null}
                            <Divider sx={{ mt: 1 }} />
                          </Box>
                        ))}
                        {!(floorReviewsQuery.data?.reviews ?? []).length ? <Alert severity="info">No comments yet.</Alert> : null}
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            disabled={floorReviewsPage === 0}
                            onClick={() => setFloorReviewsPage((prev) => Math.max(0, prev - 1))}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            disabled={(floorReviewsQuery.data?.reviews ?? []).length < floorReviewsLimit}
                            onClick={() => setFloorReviewsPage((prev) => prev + 1)}
                          >
                            Next
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      {/* Booking Dialog */}
      <BookingDialog
        open={bookingDialogOpen}
        room={room}
        selectedFloorId={floor.id}
        bookingType={bookingType}
        selectedAreaKeys={resolvedSelectedAreaKeys}
        areaOptions={areaOptions}
        selectedPlan={selectedPlan}
        isLight={isLight}
        onClose={() => {
          setBookingDialogOpen(false)
          setBookingError(null)
        }}
        onSubmit={handleBookingSubmit}
        isLoading={createBookingMutation.isPending}
        error={bookingError}
        initialBookingDate={selectedCalendarDate}
      />

      {/* Area Details Modal */}
      <MuiDialog
        open={Boolean(selectedAreaDetails)}
        onClose={() => setSelectedAreaDetails(null)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            background: isLight ? '#ffffff' : 'rgba(10, 14, 26, 0.95)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedAreaDetails?.name} Details
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Pricing</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>€{selectedAreaDetails?.price}/hour</Typography>
            </Box>
            {selectedAreaDetails?.includes && selectedAreaDetails.includes.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Features Included</Typography>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                  {selectedAreaDetails.includes.map((feature) => (
                    <Chip key={feature} size="small" label={feature} variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAreaDetails(null)} variant="outlined">
            Close
          </Button>
          {bookingType === 'SELECTED_AREAS' && (
            <Button
              variant="contained"
              onClick={() => {
                if (selectedAreaDetails) {
                  const key = selectedAreaDetails.name
                  setSelectedAreaKeys((current) =>
                    current.includes(key) ? current : [...current, key]
                  )
                  setSelectedAreaDetails(null)
                }
              }}
            >
              Select Area
            </Button>
          )}
        </DialogActions>
      </MuiDialog>

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
