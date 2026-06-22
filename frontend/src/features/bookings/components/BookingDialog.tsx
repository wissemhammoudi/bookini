import { useEffect } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material'
import EventIcon from '@mui/icons-material/Event'
import GroupIcon from '@mui/icons-material/Group'
import RoomServiceIcon from '@mui/icons-material/RoomService'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'

import type { Room } from '../constants'
import type { BookingFormData } from '../types'
import { useBookingForm, usePriceCalculation } from '../hooks'

interface BookingDialogProps {
  open: boolean
  room: Room | null
  selectedPlan: string
  isLight: boolean
  onClose: () => void
  onSubmit: (data: BookingFormData & { roomId: number; roomName: string; planId: string; price: number }) => Promise<boolean> | boolean
  isLoading?: boolean
  error?: string | null
  initialBookingDate?: string | null
}

export const BookingDialog = ({
  open,
  room,
  selectedPlan,
  isLight,
  onClose,
  onSubmit,
  isLoading = false,
  error,
  initialBookingDate,
}: BookingDialogProps) => {
  const { formData, handleInputChange, resetForm } = useBookingForm()
  const { calculatePrice } = usePriceCalculation()

  useEffect(() => {
    if (open && initialBookingDate) {
      handleInputChange('bookingDate', initialBookingDate)
    }
  }, [open, initialBookingDate, handleInputChange])

  const price = room ? calculatePrice(room.price, formData.startTime, formData.endTime, selectedPlan) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!room) return

    const payload = {
      ...formData,
      roomId: room.id,
      roomName: room.name,
      planId: selectedPlan,
      price,
    }

    const result = await onSubmit(payload)
    if (result !== false) {
      resetForm()
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
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            background: isLight
              ? 'linear-gradient(135deg, rgba(0,89,179,0.08) 0%, rgba(0,168,143,0.06) 100%)'
              : 'linear-gradient(135deg, rgba(0,89,179,0.22) 0%, rgba(0,168,143,0.12) 100%)',
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 999,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.main',
                color: '#fff',
              }}
            >
              <RoomServiceIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
                Reservation Request
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.15 }}>
                {room?.name}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Chip icon={<EventIcon />} label="Choose your date & time" size="small" variant="outlined" />
            <Chip icon={<GroupIcon />} label={`Capacity ${room?.capacity ?? 0}`} size="small" variant="outlined" />
            <Chip label={`€${room?.price ?? 0}/hour`} size="small" color="primary" variant="filled" />
          </Stack>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Stack spacing={3}>
            {error ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            ) : null}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: isLight ? 'rgba(0, 89, 179, 0.1)' : 'rgba(255, 255, 255, 0.08)',
                background: isLight ? '#f8fbff' : alpha('#0a0e1a', 0.28),
              }}
            >
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                    Selected Space
                  </Typography>
                  <Typography sx={{ fontWeight: 800 }}>{room?.name}</Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Chip size="small" label={`${room?.capacity ?? 0} seats`} variant="outlined" />
                  <Chip size="small" label={`€${room?.price ?? 0}/hr`} color="primary" variant="outlined" />
                </Stack>
              </Stack>
            </Paper>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Date & Time
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    label="Date"
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                    required
                    fullWidth
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      required
                      fullWidth
                      size="small"
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      label="End Time"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      required
                      fullWidth
                      size="small"
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Stack>
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Guest Details
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    label="Full Name"
                    value={formData.guestName}
                    onChange={(e) => handleInputChange('guestName', e.target.value)}
                    required
                    fullWidth
                    size="small"
                  />
                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      label="Email"
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                      required
                      fullWidth
                      size="small"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ fontSize: '1.1rem' }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <TextField
                      label="Phone"
                      value={formData.guestPhone}
                      onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                      required
                      fullWidth
                      size="small"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon sx={{ fontSize: '1.1rem' }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>
            </Stack>

            <Divider />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Capacity
                </Typography>
                <TextField
                  label="Number of Participants"
                  type="number"
                  value={formData.participants}
                  onChange={(e) => handleInputChange('participants', e.target.value)}
                  fullWidth
                  size="small"
                  slotProps={{ htmlInput: { min: 1, max: room?.capacity } }}
                />
              </Box>

              <Box sx={{ flex: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Notes
                </Typography>
                <TextField
                  label="Special Requests or Notes"
                  multiline
                  minRows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Any special requirements or notes..."
                />
              </Box>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: 3,
                border: '1px solid',
                borderColor: isLight ? 'rgba(0, 89, 179, 0.1)' : 'rgba(255, 255, 255, 0.08)',
                background: isLight
                  ? 'linear-gradient(135deg, rgba(0,89,179,0.04) 0%, rgba(0,168,143,0.04) 100%)'
                  : alpha('#0a0e1a', 0.34),
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                    Estimated Price
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1 }}>
                    €{price.toFixed(2)}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Chip icon={<AttachMoneyIcon />} label={`€${room?.price}/hour`} variant="outlined" />
                  <Chip label={formData.startTime && formData.endTime ? `${Math.max(0, parseInt(formData.endTime.split(':')[0]) - parseInt(formData.startTime.split(':')[0]))}h selected` : 'Pick time range'} variant="outlined" />
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button onClick={onClose} disabled={isLoading} variant="outlined">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ fontWeight: 800, px: 3 }}
            disabled={isLoading}
          >
            {isLoading ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
