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
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'
import { useNavigate, useParams } from 'react-router-dom'

import { useColorMode } from '@/app/use-color-mode'
import { PublicFooter } from '@/features/public/components/public-footer'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import { BookingDialog } from './components/BookingDialog'
import type { BookingFormData } from './types'
import type { PublicRoom } from '@/lib/api'
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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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
  const [selectedFloorId, setSelectedFloorId] = useState<string | undefined>(undefined)
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

  const resolvedSelectedFloorId = useMemo(() => {
    if (!room) {
      return undefined
    }

    const floorIds = room.floors?.map((floor) => floor.id) ?? []
    if (selectedFloorId && floorIds.includes(selectedFloorId)) {
      return selectedFloorId
    }

    return room.primary_floor_id ?? room.floors?.[0]?.id
  }, [room, selectedFloorId])

  const media = useMemo(() => (room ? buildMedia(room) : { images: [], videos: [] }), [room])

  const createBookingMutation = useMutation({ mutationFn: createPublicBookingRequest })
  const floorReviewsLimit = 5
  const reviewFloorId = resolvedSelectedFloorId
  const hasReviewableFloor = Boolean(reviewFloorId && UUID_PATTERN.test(reviewFloorId))

  const floorReviewsQuery = useQuery({
    queryKey: ['floor-reviews', reviewFloorId, floorReviewsPage, floorReviewsMinFilter],
    queryFn: () =>
      listFloorReviews(reviewFloorId!, {
        limit: floorReviewsLimit,
        offset: floorReviewsPage * floorReviewsLimit,
        min_rating: floorReviewsMinFilter > 0 ? floorReviewsMinFilter : undefined,
      }),
    enabled: hasReviewableFloor,
  })

  const upsertFloorReviewMutation = useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      upsertMyFloorReview(reviewFloorId!, payload),
    onSuccess: async () => {
      await floorReviewsQuery.refetch()
      setFloorComment('')
      setFloorRating(5)
    },
  })

  const deleteFloorReviewMutation = useMutation({
    mutationFn: () => deleteMyFloorReview(reviewFloorId!),
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
    if (!room) {
      return
    }

    const iso = toIsoDate(date)
    setSelectedCalendarDate(iso)
    setBookingError(null)
    setBookingDialogOpen(true)
  }

  const handleBookingSubmit = async (data: BookingFormData & { roomId: number; floorId?: string; roomName: string; planId: string; price: number }) => {
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
        floor_id: data.floorId,
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
        <PublicFooter isLight={isLight} />
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
            <Button variant="outlined" onClick={() => navigate('/book')}>
              Back to spaces
            </Button>
            {room.admin_id ? (
              <Button variant="text" onClick={() => navigate(`/admins/${room.admin_id}`)}>
                View owner
              </Button>
            ) : null}
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
                        See what people said about this space and leave your own rating.
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

                  {hasReviewableFloor && floorReviewsQuery.isError ? <Alert severity="error">Could not load ratings and comments right now.</Alert> : null}

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <CardContent>
                          <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              Rate this place
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
                                disabled={upsertFloorReviewMutation.isPending || !hasReviewableFloor}
                                onClick={() =>
                                  hasReviewableFloor
                                    ? upsertFloorReviewMutation.mutate({
                                      rating: floorRating,
                                      comment: floorComment.trim() || undefined,
                                    })
                                    : null
                                }
                              >
                                Save rating
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                disabled={deleteFloorReviewMutation.isPending || !hasReviewableFloor}
                                onClick={() => {
                                  if (!hasReviewableFloor) return
                                  deleteFloorReviewMutation.mutate()
                                }}
                              >
                                Delete my rating
                              </Button>
                            </Stack>
                            {!hasReviewableFloor ? (
                              <Alert severity="info">Ratings are not available for this place yet.</Alert>
                            ) : null}
                            {upsertFloorReviewMutation.isError || deleteFloorReviewMutation.isError ? (
                              <Alert severity="error">You need to be logged in and have a completed booking to rate this place.</Alert>
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
                  const isSelected = selectedCalendarDate === iso

                  return (
                    <Button
                      key={iso}
                      variant={isSelected ? 'contained' : 'outlined'}
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
                            bgcolor: isSelected ? 'common.white' : 'primary.main',
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
        selectedFloorId={resolvedSelectedFloorId}
        onFloorChange={setSelectedFloorId}
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

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
