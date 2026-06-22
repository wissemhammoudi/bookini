import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import { RoomCard } from './components/RoomCard'
import { BookingDialog } from './components/BookingDialog'
import type { BookingFormData } from './types'
import type { Room } from './constants'
import { createPublicBookingRequest, listPublicBookingCalendarSlots, listPublicRooms } from '@/lib/api'

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

/**
 * Public Booking Page
 * Allows users to browse subscription plans and book rooms
 *
 * Features:
 * - Select subscription plan (Pay-As-You-Go, Starter, Professional)
 * - Browse available rooms with amenities and pricing
 * - Book rooms with date, time, and guest information
 * - Real-time price calculation based on plan and duration
 */
export const PublicBookingPage = () => {
  const navigate = useNavigate()
  const { mode } = useColorMode()
  const isLight = mode === 'light'
  const roomsQuery = useQuery({
    queryKey: ['public-rooms-catalog'],
    queryFn: listPublicRooms,
  })
  const rooms = roomsQuery.data ?? []

  const [selectedPlan] = useState('pay-as-you-go')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  const createBookingMutation = useMutation({ mutationFn: createPublicBookingRequest })

  const calendarStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const calendarEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)

  const calendarSlotsQuery = useQuery({
    queryKey: [
      'public-booking-calendar-slots',
      selectedRoom?.id,
      toIsoDate(calendarStart),
      toIsoDate(calendarEnd),
    ],
    queryFn: () =>
      listPublicBookingCalendarSlots({
        room_id: selectedRoom!.id,
        start_date: toIsoDate(calendarStart),
        end_date: toIsoDate(calendarEnd),
      }),
    enabled: Boolean(selectedRoom),
  })

  useEffect(() => {
    if (!selectedRoom && rooms.length > 0) {
      setSelectedRoom(rooms[0])
    }
  }, [rooms, selectedRoom])

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

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room)
    setBookingError(null)
    setBookingDialogOpen(true)
  }

  const handleCalendarDateClick = (date: Date) => {
    if (!selectedRoom) {
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
        return
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
    } catch {
      setBookingError('Could not complete your booking. Please verify your details and try again.')
    }
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

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={8}>
          {/* Header */}
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
              Book Your Perfect Space
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2, maxWidth: 600 }}>
              Choose a subscription plan that works for you, then select from our available rooms and spaces.
            </Typography>
          </Box>

          {bookingError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {bookingError}
            </Alert>
          ) : null}

          {/* Rooms Section */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
              Available Rooms
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 3,
              }}
            >
              {rooms.map((room) => (
                <Box key={room.id}>
                  <RoomCard
                    room={room}
                    isLight={isLight}
                    onBookNow={handleRoomSelect}
                  />
                </Box>
              ))}
            </Box>
          </Box>

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
                    Pick a date to open the request form. Reserved time slots are shown per selected room.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>

              {roomsQuery.isLoading ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Loading spaces from backend...
                </Alert>
              ) : null}

              {roomsQuery.isError ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  Could not load spaces from backend right now.
                </Alert>
              ) : null}

              {rooms.length === 0 && !roomsQuery.isLoading ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  No spaces are available right now.
                </Alert>
              ) : null}

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {rooms.map((room) => (
                  <Chip
                    key={room.id}
                    label={room.name}
                    color={selectedRoom?.id === room.id ? 'primary' : 'default'}
                    variant={selectedRoom?.id === room.id ? 'filled' : 'outlined'}
                    onClick={() => setSelectedRoom(room)}
                  />
                ))}
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {monthLabel}
              </Typography>

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
                      Reserved slots for {selectedCalendarDate} ({selectedRoom?.name})
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

      {/* Booking Dialog */}
      <BookingDialog
        open={bookingDialogOpen}
        room={selectedRoom}
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
