import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import type { PublicFloor } from '@/lib/api'
import { formatShape } from '../floor-details-utils'
import type { BookingType } from '../floor-details-utils'

type FloorDetailsHeroSectionProps = {
  isLight: boolean
  floor: PublicFloor
  effectiveDisplayPrice: number
  bookingType: BookingType
  images: string[]
  onBookingTypeChange: (next: BookingType) => void
}

export const FloorDetailsHeroSection = ({
  isLight,
  floor,
  effectiveDisplayPrice,
  bookingType,
  images,
  onBookingTypeChange,
}: FloorDetailsHeroSectionProps) => {
  return (
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
          Capacity {floor.capacity} people • ${effectiveDisplayPrice}/hour
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <AspectRatioIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Floor Size
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {floor.floor_size_sqm ?? 100} sqm
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <InfoOutlinedIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Floor Shape
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatShape(floor.floor_shape)}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <MeetingRoomOutlinedIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Booking Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {bookingType === 'WHOLE_FLOOR' ? 'Whole floor' : 'Selected areas'}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <PhotoLibraryOutlinedIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Photos
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {images.length}
                </Typography>
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
            onClick={() => onBookingTypeChange('WHOLE_FLOOR')}
          />
          <Chip
            label="Select Areas"
            color={bookingType === 'SELECTED_AREAS' ? 'primary' : 'default'}
            variant={bookingType === 'SELECTED_AREAS' ? 'filled' : 'outlined'}
            onClick={() => onBookingTypeChange('SELECTED_AREAS')}
          />
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          {images.slice(0, 3).map((src, index) => (
            <Box
              key={`${src}-${index}`}
              component="img"
              src={src}
              alt={`${floor.floor_name} preview ${index + 1}`}
              sx={{
                width: '100%',
                height: { xs: 180, sm: 220 },
                objectFit: 'cover',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          ))}
        </Box>
      </Stack>
    </Paper>
  )
}
