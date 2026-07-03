import { Box, Chip, Paper, Stack, Typography, alpha } from '@mui/material'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'

import type { BookingFormData } from '../types'

export const PriceSummaryCard = ({
  isLight,
  price,
  originalPrice,
  discount,
  days,
  hourlyRate,
  formData,
}: {
  isLight: boolean
  price: number
  originalPrice: number
  discount: number
  days: number
  hourlyRate: number
  formData: BookingFormData
}) => {
  const startHour = Number.parseInt(formData.startTime.split(':')[0] ?? '0', 10)
  const endHour = Number.parseInt(formData.endTime.split(':')[0] ?? '0', 10)
  const durationHours = Number.isFinite(startHour) && Number.isFinite(endHour)
    ? Math.max(0, endHour - startHour)
    : 0

  return (
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
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1 }}>
                {price.toFixed(2)} TND
            </Typography>
            {discount > 0 ? (
              <Typography
                variant="body1"
                sx={{
                  textDecoration: 'line-through',
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {originalPrice.toFixed(2)} TND
              </Typography>
            ) : null}
          </Stack>
          {discount > 0 ? (
            <Chip
              size="small"
              color="success"
              label={`Saved ${(discount * 100).toFixed(0)}% (${days} days)`}
              sx={{ mt: 0.75, fontWeight: 700 }}
            />
          ) : null}
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Chip icon={<AttachMoneyIcon />} label={`${hourlyRate} TND/hour`} variant="outlined" />
          <Chip
            label={
              formData.startTime && formData.endTime
                ? `${durationHours}h${days > 1 ? ` x ${days} days` : ''} selected`
                : 'Pick time range'
            }
            variant="outlined"
          />
        </Stack>
      </Stack>
    </Paper>
  )
}
