import { useEffect, useMemo, useState } from 'react'
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
  alpha,
} from '@mui/material'
import axios from 'axios'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { useColorMode } from '@/app/use-color-mode'
import { PublicFooter } from '@/features/public/components/public-footer'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import {
  createPublicBookingRequest,
  listPublicBookingCalendarSlots,
  listPublicRooms,
} from '@/lib/api'
import { useBookingForm, usePriceCalculation } from './hooks'
import { overlaps, parseFloorRoomPreviews } from './floor-details-utils'
import {
  BookingDialogHeader,
  BookingFormFields,
  PriceSummaryCard,
  SelectedSpaceCard,
} from './components/booking-dialog-sections'

type BookingType = 'WHOLE_FLOOR' | 'SELECTED_AREAS'

const isValidBookingType = (value: string | null): value is BookingType => {
  return value === 'WHOLE_FLOOR' || value === 'SELECTED_AREAS'
}

const parseBookingApiError = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return 'Could not complete your booking. Please verify your details and try again.'
  }

  const responseData = error.response?.data as {
    message?: string
    detail?: string | Array<{ msg?: string; message?: string }>
  } | undefined

  if (typeof responseData?.message === 'string' && responseData.message.trim().length > 0) {
    return responseData.message
  }

  if (typeof responseData?.detail === 'string' && responseData.detail.trim().length > 0) {
    return responseData.detail
  }

  if (Array.isArray(responseData?.detail) && responseData.detail.length > 0) {
    const [firstError] = responseData.detail
    if (typeof firstError?.msg === 'string' && firstError.msg.trim().length > 0) {
      return firstError.msg
    }
    if (typeof firstError?.message === 'string' && firstError.message.trim().length > 0) {
      return firstError.message
    }
  }

  return 'Could not complete your booking. Please verify your details and try again.'
}

export const BookingRequestPage = () => {
  const navigate = useNavigate()
  const { mode } = useColorMode()
  const isLight = mode === 'light'
  const { roomId = '', floorId = '' } = useParams()
  const [searchParams] = useSearchParams()

  const [step, setStep] = useState<'details' | 'review'>('details')
  const [bookingError, setBookingError] = useState<string | null>(null)

  const { formData, handleInputChange, resetForm } = useBookingForm()
  const { calculatePrice } = usePriceCalculation()

  const selectedPlan = 'pay-as-you-go'
  const requestedDate = searchParams.get('date') ?? ''
  const requestedType = searchParams.get('type')
  const bookingType: BookingType = isValidBookingType(requestedType) ? requestedType : 'WHOLE_FLOOR'
  const requestedAreaKeys = (searchParams.get('areas') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  const roomsQuery = useQuery({
    queryKey: ['public-rooms-catalog'],
    queryFn: listPublicRooms,
  })

  const room = useMemo(() => {
    return (roomsQuery.data ?? []).find((item) => item.id === Number.parseInt(roomId, 10)) ?? null
  }, [roomsQuery.data, roomId])

  const resolvedFloor = useMemo(() => {
    if (!room?.floors) return null
    return room.floors.find((floor) => floor.id === floorId) ?? room.floors[0] ?? null
  }, [room, floorId])

  const floorPrice = resolvedFloor?.price ?? room?.price ?? 0
  const areaOptions = useMemo(
    () => parseFloorRoomPreviews(resolvedFloor?.blueprint_image, resolvedFloor?.reservation_areas, floorPrice).map((item) => ({
      key: item.name,
      label: item.name,
      price: item.price,
      includes: item.includes,
      capacity: resolvedFloor?.capacity,
    })),
    [resolvedFloor?.blueprint_image, resolvedFloor?.reservation_areas, resolvedFloor?.capacity, floorPrice],
  )

  const selectedAreaKeys = useMemo(
    () => requestedAreaKeys.filter((key) => areaOptions.some((option) => option.key === key)),
    [requestedAreaKeys, areaOptions],
  )

  const selectedAreaOptions = areaOptions.filter((option) => selectedAreaKeys.includes(option.key))
  const selectedAreasHourlyRate = selectedAreaOptions.reduce((sum, option) => sum + option.price, 0)
  const hourlyRate = bookingType === 'SELECTED_AREAS' && selectedAreaOptions.length > 0
    ? selectedAreasHourlyRate
    : floorPrice
  const roomCapacity = resolvedFloor?.capacity ?? room?.capacity ?? 0

  const { price, originalPrice, discount, days, durationHours } = calculatePrice(
    hourlyRate,
    formData.startTime,
    formData.endTime,
    selectedPlan,
    formData.bookingDate,
    formData.endDate,
  )

  const hasValidDateRange = useMemo(() => {
    if (!formData.bookingDate) return false
    if (!formData.endDate) return true
    return formData.endDate >= formData.bookingDate
  }, [formData.bookingDate, formData.endDate])

  const hasValidTimeRange = durationHours > 0
  const hasValidScope = bookingType !== 'SELECTED_AREAS' || selectedAreaKeys.length > 0
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.guestEmail.trim())

  const isParticipantCountValid = useMemo(() => {
    if (!formData.participants) return true
    const participants = Number.parseInt(formData.participants, 10)
    if (!Number.isFinite(participants) || participants <= 0) return false
    return roomCapacity <= 0 || participants <= roomCapacity
  }, [formData.participants, roomCapacity])

  const isDetailsStepValid = Boolean(
    formData.bookingDate
      && formData.startTime
      && formData.endTime
      && formData.guestName.trim()
      && formData.guestEmail.trim()
      && isEmailValid
      && formData.guestPhone.trim()
      && hasValidDateRange
      && hasValidTimeRange
      && hasValidScope
      && isParticipantCountValid,
  )

  const participantRangeMessage = !isParticipantCountValid
    ? `Participant count must be between 1 and ${roomCapacity}.`
    : null
  const isReviewStep = step === 'review'

  const createBookingMutation = useMutation({ mutationFn: createPublicBookingRequest })

  useEffect(() => {
    if (requestedDate) {
      handleInputChange('bookingDate', requestedDate)
    }
  }, [requestedDate, handleInputChange])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!room || !resolvedFloor || !isDetailsStepValid) return

    setBookingError(null)

    try {
      const latestSlots = await listPublicBookingCalendarSlots({
        room_id: room.id,
        start_date: formData.bookingDate,
        end_date: formData.endDate || formData.bookingDate,
      })

      const conflictingSlot = latestSlots.find((slot) =>
        overlaps(formData.startTime, formData.endTime, slot.start_time, slot.end_time),
      )
      if (conflictingSlot) {
        setBookingError(
          `This time is already reserved (${conflictingSlot.start_time} - ${conflictingSlot.end_time}). Please choose another slot.`,
        )
        return
      }

      const created = await createBookingMutation.mutateAsync({
        room_id: room.id,
        floor_id: resolvedFloor.id,
        room_key: selectedAreaOptions.length === 1 ? selectedAreaOptions[0].key : undefined,
        booking_type: bookingType,
        selected_area_keys: bookingType === 'SELECTED_AREAS' ? selectedAreaKeys : undefined,
        room_name:
          bookingType === 'SELECTED_AREAS' && selectedAreaOptions.length > 0
            ? `${room.name} - ${resolvedFloor.floor_name} (${selectedAreaOptions.length} areas)`
            : `${room.name} - ${resolvedFloor.floor_name}`,
        plan_id: selectedPlan,
        guest_name: formData.guestName,
        guest_email: formData.guestEmail,
        guest_phone: formData.guestPhone,
        booking_date: formData.bookingDate,
        end_date: formData.endDate || undefined,
        start_time: formData.startTime,
        end_time: formData.endTime,
        participants: Number.parseInt(formData.participants, 10) || 1,
        notes: formData.notes || undefined,
        price,
      })

      if (!created?.booking_reference || typeof created.booking_reference !== 'string') {
        setBookingError('Booking was created but no reference was returned. Please contact support with your booking details.')
        return
      }

      resetForm()
      setStep('details')
      navigate(`/booking-confirmation/${created.booking_reference}`)
    } catch (error) {
      setBookingError(parseBookingApiError(error))
    }
  }

  const handleFloorChange = (nextFloorId: string) => {
    const params = new URLSearchParams()
    if (requestedDate) params.set('date', requestedDate)
    params.set('type', bookingType)
    if (selectedAreaKeys.length > 0) {
      params.set('areas', selectedAreaKeys.join(','))
    }

    navigate(`/book/place/${roomId}/floor/${nextFloorId}/reserve?${params.toString()}`)
  }

  if (roomsQuery.isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar isLight={isLight} />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="info">Loading reservation page...</Alert>
        </Container>
        <PublicFooter isLight={isLight} />
      </Box>
    )
  }

  if (!room || !resolvedFloor) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar isLight={isLight} />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Stack spacing={2}>
            <Alert severity="error">The selected floor could not be found.</Alert>
            <Button variant="outlined" onClick={() => navigate('/book')}>
              Back to spaces
            </Button>
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

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1} sx={{ alignSelf: 'flex-start' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/book/place/${roomId}/floor/${resolvedFloor.id}`)}
            >
              Back to floor
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: isLight ? 'rgba(0, 89, 179, 0.1)' : 'rgba(255, 255, 255, 0.08)',
              background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.9),
              backgroundImage: isLight
                ? 'none'
                : `linear-gradient(135deg, ${alpha('#101d32', 0.8)} 0%, ${alpha('#0a0e1a', 0.9)} 100%)`,
            }}
          >
            <BookingDialogHeader
              isLight={isLight}
              roomName={room.name}
              roomCapacity={roomCapacity}
              hourlyRate={hourlyRate}
            />

            <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                  <Chip
                    label="1. Details"
                    color={!isReviewStep ? 'primary' : 'default'}
                    variant={!isReviewStep ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    label="2. Review & Confirm"
                    color={isReviewStep ? 'primary' : 'default'}
                    variant={isReviewStep ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 3,
                    alignItems: 'start',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 340px' },
                  }}
                >
                  <Stack spacing={3}>
                    {bookingError ? (
                      <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {bookingError}
                      </Alert>
                    ) : null}

                    {!hasValidScope ? (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        No areas were selected for this reservation scope. Go back to the floor page and select one or more areas.
                      </Alert>
                    ) : null}

                    {!hasValidDateRange ? (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        End date must be greater than or equal to start date.
                      </Alert>
                    ) : null}

                    {formData.startTime && formData.endTime && !hasValidTimeRange ? (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        End time must be after start time.
                      </Alert>
                    ) : null}

                    {participantRangeMessage ? (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        {participantRangeMessage}
                      </Alert>
                    ) : null}

                    {formData.guestEmail.trim() && !isEmailValid ? (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        Please enter a valid email address.
                      </Alert>
                    ) : null}

                    <SelectedSpaceCard
                      room={room}
                      resolvedFloor={resolvedFloor}
                      roomCapacity={roomCapacity}
                      hourlyRate={hourlyRate}
                      bookingType={bookingType}
                      selectedAreaOptions={selectedAreaOptions}
                      onFloorChange={handleFloorChange}
                      isLight={isLight}
                    />

                    {step === 'details' ? (
                      <BookingFormFields
                        formData={formData}
                        handleInputChange={handleInputChange}
                        roomCapacity={roomCapacity}
                      />
                    ) : (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: isLight ? 'rgba(0, 89, 179, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                          background: isLight ? '#f8fbff' : alpha('#0a0e1a', 0.32),
                        }}
                      >
                        <Stack spacing={1.25}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            Review Your Booking
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Confirm the information below before you submit.
                          </Typography>
                          <Divider />
                          <Typography variant="body2"><strong>Date:</strong> {formData.bookingDate}{formData.endDate ? ` -> ${formData.endDate}` : ''}</Typography>
                          <Typography variant="body2"><strong>Time:</strong> {formData.startTime} - {formData.endTime}</Typography>
                          <Typography variant="body2"><strong>Guest:</strong> {formData.guestName}</Typography>
                          <Typography variant="body2"><strong>Email:</strong> {formData.guestEmail}</Typography>
                          <Typography variant="body2"><strong>Phone:</strong> {formData.guestPhone}</Typography>
                          {formData.participants ? (
                            <Typography variant="body2"><strong>Participants:</strong> {formData.participants}</Typography>
                          ) : null}
                        </Stack>
                      </Paper>
                    )}

                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between' }}>
                      {step === 'details' ? (
                        <>
                          <Button
                            variant="outlined"
                            onClick={() => navigate(`/book/place/${roomId}/floor/${resolvedFloor.id}`)}
                            disabled={createBookingMutation.isPending}
                          >
                            Back
                          </Button>
                          <Button
                            type="button"
                            variant="contained"
                            sx={{ fontWeight: 800, px: 3 }}
                            disabled={!isDetailsStepValid || createBookingMutation.isPending}
                            onClick={() => setStep('review')}
                          >
                            Continue
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outlined"
                            onClick={() => setStep('details')}
                            disabled={createBookingMutation.isPending}
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            sx={{ fontWeight: 800, px: 3 }}
                            disabled={!isDetailsStepValid || createBookingMutation.isPending}
                          >
                            {createBookingMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Stack>

                  <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 92 } }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isLight ? 'rgba(0, 89, 179, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                        background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.32),
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Booking Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {isReviewStep
                            ? 'Final step: review and confirm your reservation.'
                            : 'Fill in your booking details, then continue to review.'}
                        </Typography>
                      </Stack>
                    </Paper>

                    <PriceSummaryCard
                      isLight={isLight}
                      price={price}
                      originalPrice={originalPrice}
                      discount={discount}
                      days={days}
                      durationHours={durationHours}
                      hourlyRate={hourlyRate}
                      formData={formData}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Container>

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
