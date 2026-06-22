import { useState } from 'react'
import {
  Alert,
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
  onSubmit: (data: BookingFormData & { roomId: number; roomName: string; planId: string; price: number }) => void
  isLoading?: boolean
}

export const BookingDialog = ({
  open,
  room,
  selectedPlan,
  isLight,
  onClose,
  onSubmit,
  isLoading = false,
}: BookingDialogProps) => {
  const { formData, handleInputChange, resetForm } = useBookingForm()
  const { calculatePrice } = usePriceCalculation()
  const [submitted, setSubmitted] = useState(false)

  const price = room ? calculatePrice(room.price, formData.startTime, formData.endTime, selectedPlan) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!room) return
    
    const payload = {
      ...formData,
      roomId: room.id,
      roomName: room.name,
      planId: selectedPlan,
      price,
    }
    
    onSubmit(payload)
    setSubmitted(true)
    
    setTimeout(() => {
      setSubmitted(false)
      resetForm()
      onClose()
    }, 2000)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.9),
          backgroundImage: isLight ? 'none' : `linear-gradient(135deg, ${alpha('#101d32', 0.8)} 0%, ${alpha('#0a0e1a', 0.9)} 100%)`,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        Book {room?.name}
      </DialogTitle>

      {submitted && (
        <DialogContent>
          <Alert severity="success">
            Booking confirmed! Check your email for confirmation details and your reference number.
          </Alert>
        </DialogContent>
      )}

      {!submitted && (
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 2 }}>
            <Stack spacing={2.5}>
              {/* Date and Time */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
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
                    InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="End Time"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      required
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* Guest Info */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Your Information
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
                            <EmailIcon sx={{ fontSize: '1.2rem' }} />
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
                            <PhoneIcon sx={{ fontSize: '1.2rem' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Participants & Notes */}
              <Box>
                <TextField
                  label="Number of Participants"
                  type="number"
                  value={formData.participants}
                  onChange={(e) => handleInputChange('participants', e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: room?.capacity }}
                />
              </Box>

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

              <Divider />

              {/* Price Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  background: isLight ? 'transparent' : alpha('#0a0e1a', 0.3),
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Room: €{room?.price}/hour
                    </Typography>
                    <Typography variant="body2">
                      {formData.startTime && formData.endTime && `${Math.max(0, parseInt(formData.endTime.split(':')[0]) - parseInt(formData.startTime.split(':')[0]))} hours`}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
                      <AttachMoneyIcon sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
                      <Typography sx={{ fontWeight: 700 }}>Total Price:</Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      €{price.toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ fontWeight: 700 }}
              disabled={isLoading}
            >
              {isLoading ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  )
}

import { Box } from '@mui/material'
