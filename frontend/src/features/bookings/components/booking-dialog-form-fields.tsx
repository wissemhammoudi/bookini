import {
  Box,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'

import type { BookingFormData } from '../types'

export type HandleInputChange = (field: keyof BookingFormData, value: string) => void

export const BookingFormFields = ({
  formData,
  handleInputChange,
  roomCapacity,
}: {
  formData: BookingFormData
  handleInputChange: HandleInputChange
  roomCapacity: number
}) => {
  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
            Date & Time
          </Typography>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Start Date"
                type="date"
                value={formData.bookingDate}
                onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                required
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End Date (Optional)"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
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
            Contact Details
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
            slotProps={{ htmlInput: { min: 1, max: roomCapacity } }}
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
    </>
  )
}
