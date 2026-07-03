import { useEffect } from 'react'
import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  alpha,
} from '@mui/material'

import type { PublicRoom } from '@/lib/api'
import type { BookingFormData } from '../types'
import { useBookingForm, usePriceCalculation } from '../hooks'
import {
  BookingDialogHeader,
  BookingFormFields,
  PriceSummaryCard,
  SelectedSpaceCard,
} from './booking-dialog-sections'

type BookingType = 'WHOLE_FLOOR' | 'SELECTED_AREAS'

interface BookingDialogProps {
  open: boolean
  room: PublicRoom | null
  selectedFloorId?: string
  onFloorChange?: (floorId: string) => void
  bookingType?: BookingType
  selectedAreaKeys?: string[]
  areaOptions?: Array<{ key: string; label: string; price: number; includes?: string[]; capacity?: number }>
  selectedPlan: string
  isLight: boolean
  onClose: () => void
  onSubmit: (data: BookingFormData & { roomId: number; floorId?: string; roomKey?: string; bookingType?: BookingType; selectedAreaKeys?: string[]; roomName: string; planId: string; price: number }) => Promise<boolean> | boolean
  isLoading?: boolean
  error?: string | null
  initialBookingDate?: string | null
}

export const BookingDialog = ({
  open,
  room,
  selectedFloorId,
  onFloorChange,
  bookingType = 'WHOLE_FLOOR',
  selectedAreaKeys = [],
  areaOptions = [],
  selectedPlan,
  isLight,
  onClose,
  onSubmit,
  isLoading = false,
  error,
  initialBookingDate,
}: BookingDialogProps) => {
  const [step, setStep] = useState<'details' | 'review'>('details')
  const { formData, handleInputChange, resetForm } = useBookingForm()
  const { calculatePrice } = usePriceCalculation()

  const resolvedFloor = room?.floors?.find((floor) => floor.id === selectedFloorId) ?? room?.floors?.[0]
  const selectedAreaOptions = areaOptions.filter((option) => selectedAreaKeys.includes(option.key))
  const selectedAreasHourlyRate = selectedAreaOptions.reduce((sum, option) => sum + option.price, 0)
  const hourlyRate = bookingType === 'SELECTED_AREAS' && selectedAreaOptions.length > 0
    ? selectedAreasHourlyRate
    : resolvedFloor?.price ?? room?.price ?? 0
  const roomCapacity = resolvedFloor?.capacity ?? room?.capacity ?? 0

  useEffect(() => {
    if (open && initialBookingDate) {
      handleInputChange('bookingDate', initialBookingDate)
    }
  }, [open, initialBookingDate, handleInputChange])

  const { price, originalPrice, discount, days, durationHours } = room
    ? calculatePrice(hourlyRate, formData.startTime, formData.endTime, selectedPlan, formData.bookingDate, formData.endDate)
    : { price: 0, originalPrice: 0, discount: 0, days: 1, durationHours: 0 }

  const hasValidDateRange = useMemo(() => {
    if (!formData.bookingDate) return false
    if (!formData.endDate) return true
    return formData.endDate >= formData.bookingDate
  }, [formData.bookingDate, formData.endDate])

  const hasValidTimeRange = durationHours > 0

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
      && formData.guestPhone.trim()
      && hasValidDateRange
      && hasValidTimeRange
      && isParticipantCountValid,
  )

  const participantRangeMessage = !isParticipantCountValid
    ? `Participant count must be between 1 and ${roomCapacity}.`
    : null

  useEffect(() => {
    if (!open) {
      setStep('details')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!room) return
    if (!isDetailsStepValid) return

    const payload = {
      ...formData,
      roomId: room.id,
      floorId: resolvedFloor?.id,
      roomKey: selectedAreaOptions.length === 1 ? selectedAreaOptions[0].key : undefined,
      bookingType,
      selectedAreaKeys: bookingType === 'SELECTED_AREAS' ? selectedAreaKeys : undefined,
      roomName:
        bookingType === 'SELECTED_AREAS' && selectedAreaOptions.length > 0
          ? `${room.name} - ${resolvedFloor?.floor_name ?? 'Floor'} (${selectedAreaOptions.length} areas)`
          : resolvedFloor
            ? `${room.name} - ${resolvedFloor.floor_name}`
            : room.name,
      planId: selectedPlan,
      price,
    }

    const result = await onSubmit(payload)
    if (result !== false) {
      resetForm()
      setStep('details')
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.9),
          backgroundImage: isLight
            ? 'none'
            : `linear-gradient(135deg, ${alpha('#101d32', 0.8)} 0%, ${alpha('#0a0e1a', 0.9)} 100%)`,
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <BookingDialogHeader
          isLight={isLight}
          roomName={room?.name}
          roomCapacity={roomCapacity}
          hourlyRate={hourlyRate}
        />
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Stack spacing={3}>
            {error ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
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

            <SelectedSpaceCard
              room={room}
              resolvedFloor={resolvedFloor}
              roomCapacity={roomCapacity}
              hourlyRate={hourlyRate}
              bookingType={bookingType}
              selectedAreaOptions={selectedAreaOptions}
              onFloorChange={onFloorChange}
              isLight={isLight}
            />

            {step === 'details' ? (
              <BookingFormFields
                formData={formData}
                handleInputChange={handleInputChange}
                roomCapacity={roomCapacity}
              />
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Review your reservation details below, then confirm your booking.
              </Alert>
            )}

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
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          {step === 'details' ? (
            <>
              <Button onClick={onClose} disabled={isLoading} variant="outlined">
                Cancel
              </Button>
              <Button
                type="button"
                variant="contained"
                sx={{ fontWeight: 800, px: 3 }}
                disabled={!isDetailsStepValid || isLoading}
                onClick={() => setStep('review')}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setStep('details')} disabled={isLoading} variant="outlined">
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ fontWeight: 800, px: 3 }}
                disabled={!isDetailsStepValid || isLoading}
              >
                {isLoading ? 'Confirming...' : 'Confirm Booking'}
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  )
}
