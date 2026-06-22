import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'
import { useNavigate, useParams } from 'react-router-dom'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import { BookingDialog } from './components/BookingDialog'
import type { BookingFormData } from './types'
import type { PublicRoom } from '@/lib/api'
import {
  createPublicBookingRequest,
  listPublicBookingCalendarSlots,
  listPublicRooms,
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

const buildMedia = (room: PublicRoom) => {
  const imageSeed = encodeURIComponent(room.name.toLowerCase().replace(/\s+/g, '-'))

  const fallback = [
    `https://picsum.photos/seed/${imageSeed}-1/1400/780`,
    `https://picsum.photos/seed/${imageSeed}-2/1200/700`,
    `https://picsum.photos/seed/${imageSeed}-3/1200/700`,
  ]

  const images = [room.cover_image, ...(room.gallery ?? [])]
    .filter((item): item is string => Boolean(item))
    .slice(0, 3)

  return {
    images: images.length > 0 ? images : fallback,
    videos: room.video_url
      ? [room.video_url]
      : ['https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0'],
  }
}

export const PlaceDetailsPage = () => {
  const navigate = useNavigate()
  const { roomId = '' } = useParams()
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  const [selectedPlan] = useState('pay-as-you-go')
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  const roomsQuery = useQuery({
    queryKey: ['public-rooms-catalog'],
    queryFn: listPublicRooms,
  })

  const room = useMemo(() => {
    return (roomsQuery.data ?? []).find((item) => item.id === Number.parseInt(roomId, 10)) ?? null
  }, [roomsQuery.data, roomId])

  const media = useMemo(() => (room ? buildMedia(room) : { images: [], videos: [] }), [room])

  const createBookingMutation = useMutation({ mutationFn: createPublicBookingRequest })

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
    if (!room) {
      return
    }

    const iso = toIsoDate(date)
    setSelectedCalendarDate(iso)
    setBookingError(null)
    setBookingDialogOpen(true)
  }

  const handleBookingSubmit = async (data: BookingFormData & { roomId: number; roomName: string; planId: string; price: number }) => {
    setBookingError(null)

    try {
      const latestSlots = await listPublicBookingCalendarSlots({
        room_id: data.roomId,
        start_date: data.bookingDate,
        end_date: data.bookingDate,
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
        room_name: data.roomName,
        plan_id: data.planId,
        guest_name: data.guestName,
        guest_email: data.guestEmail,
        guest_phone: data.guestPhone,
        booking_date: data.bookingDate,
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

  if (roomsQuery.isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar isLight={isLight} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="info">Loading place details...</Alert>
        </Container>
      </Box>
    )
  }

  if (!room) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar isLight={isLight} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Stack spacing={2}>
            <Alert severity="error">Place not found.</Alert>
            <Button variant="outlined" onClick={() => navigate('/book')}>Back to spaces</Button>
          </Stack>
        </Container>
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
          <Button variant="outlined" onClick={() => navigate('/book')} sx={{ alignSelf: 'flex-start' }}>
            Back to spaces
          </Button>

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
            <Stack spacing={2}>
              <Chip
                icon={<EventAvailableOutlinedIcon />}
                label="Place Details"
                color="primary"
                variant="outlined"
                sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
              />
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                {room.name}
              </Typography>
              <Typography color="text.secondary" variant="h6">
                Capacity {room.capacity} people • €{room.price}/hour
              </Typography>
              {room.description ? (
                <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                  {room.description}
                </Typography>
              ) : null}
              {room.address ? (
                <Typography variant="body2" color="text.secondary">
                  {room.address}
                </Typography>
              ) : null}
              {room.availability ? (
                <Chip label={room.availability} size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
              ) : null}
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {(room.features ?? room.amenities).map((amenity) => (
                  <Chip key={amenity} label={amenity} size="small" variant="outlined" />
                ))}
              </Stack>
            </Stack>
          </Paper>

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
                  src={media.images[0]}
                  alt={`${room.name} main`}
                  sx={{ width: '100%', height: { xs: 220, md: 360 }, objectFit: 'cover', borderRadius: 2 }}
                />
                <Stack spacing={1.5}>
                  <Box
                    component="img"
                    src={media.images[1]}
                    alt={`${room.name} secondary 1`}
                    sx={{ width: '100%', height: { xs: 140, md: 172 }, objectFit: 'cover', borderRadius: 2 }}
                  />
                  <Box
                    component="img"
                    src={media.images[2]}
                    alt={`${room.name} secondary 2`}
                    sx={{ width: '100%', height: { xs: 140, md: 172 }, objectFit: 'cover', borderRadius: 2 }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <VideoLibraryOutlinedIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Video Tour
                </Typography>
              </Stack>
              <Box
                component="iframe"
                src={media.videos[0]}
                title={`${room.name} video tour`}
                sx={{ width: '100%', height: { xs: 220, md: 420 }, border: 0, borderRadius: 2 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
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
                    Reservation Calendar
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Choose a date to open the booking form. Reserved slots are displayed below.
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

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isLight ? 'rgba(0, 89, 179, 0.16)' : 'rgba(255, 255, 255, 0.16)',
                  background: isLight ? '#f9fcff' : 'rgba(16, 29, 50, 0.55)',
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                    <MeetingRoomOutlinedIcon color="primary" />
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>{room.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Capacity {room.capacity} • €{room.price}/hour
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {(room.features ?? room.amenities).slice(0, 3).map((item) => (
                      <Chip key={item} label={item} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Stack>
              </Paper>

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {monthLabel}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Available" size="small" variant="outlined" />
                <Chip label="Reserved slots" size="small" color="primary" variant="outlined" />
                <Chip label="Click any date to reserve" size="small" variant="outlined" />
              </Stack>

              <Divider />

              {calendarSlotsQuery.isError ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  Could not load reservation calendar right now.
                </Alert>
              ) : null}

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gap: 1,
                }}
              >
                {WEEK_DAYS.map((dayName) => (
                  <Box key={dayName} sx={{ px: 0.5, py: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }} color="text.secondary">
                      {dayName}
                    </Typography>
                  </Box>
                ))}

                {dayCells.map((day, index) => {
                  if (!day) {
                    return <Box key={`empty-${index}`} sx={{ height: 86 }} />
                  }

                  const iso = toIsoDate(day)
                  const reservedSlots = reservedByDate[iso] ?? []
                  const isSelected = selectedCalendarDate === iso

                  return (
                    <Button
                      key={iso}
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => handleCalendarDateClick(day)}
                      sx={{
                        height: 86,
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexDirection: 'column',
                        p: 1,
                        textTransform: 'none',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {day.getDate()}
                      </Typography>
                      <Typography variant="caption" color={isSelected ? 'inherit' : 'text.secondary'}>
                        {reservedSlots.length > 0 ? `${reservedSlots.length} reserved` : 'Available'}
                      </Typography>
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
                      Reserved slots for {selectedCalendarDate} ({room.name})
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
        </Stack>
      </Container>

      <BookingDialog
        open={bookingDialogOpen}
        room={room}
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
    </Box>
  )
}
