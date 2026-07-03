import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material'
import EventIcon from '@mui/icons-material/Event'
import GroupIcon from '@mui/icons-material/Group'
import RoomServiceIcon from '@mui/icons-material/RoomService'

import type { PublicFloor, PublicRoom } from '@/lib/api'

export type BookingType = 'WHOLE_FLOOR' | 'SELECTED_AREAS'

export type AreaOption = {
  key: string
  label: string
  price: number
  includes?: string[]
  capacity?: number
}

export const BookingDialogHeader = ({
  isLight,
  roomName,
  roomCapacity,
  hourlyRate,
}: {
  isLight: boolean
  roomName?: string
  roomCapacity: number
  hourlyRate: number
}) => {
  return (
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
            {roomName}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
        <Chip icon={<EventIcon />} label="Choose your date & time" size="small" variant="outlined" />
        <Chip icon={<GroupIcon />} label={`Capacity ${roomCapacity}`} size="small" variant="outlined" />
        <Chip label={`${hourlyRate} TND/hour`} size="small" color="primary" variant="filled" />
      </Stack>
    </Box>
  )
}

export const SelectedSpaceCard = ({
  room,
  resolvedFloor,
  roomCapacity,
  hourlyRate,
  bookingType,
  selectedAreaOptions,
  onFloorChange,
  isLight,
}: {
  room: PublicRoom | null
  resolvedFloor?: PublicFloor
  roomCapacity: number
  hourlyRate: number
  bookingType: BookingType
  selectedAreaOptions: AreaOption[]
  onFloorChange?: (floorId: string) => void
  isLight: boolean
}) => {
  return (
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
          <Chip size="small" label={`${roomCapacity} seats`} variant="outlined" />
          <Chip size="small" label={`${hourlyRate} TND/hour`} color="primary" variant="outlined" />
        </Stack>
      </Stack>

      <Chip
        size="small"
        color={bookingType === 'SELECTED_AREAS' ? 'secondary' : 'primary'}
        variant="outlined"
        label={bookingType === 'SELECTED_AREAS' ? 'Booking Scope: Selected Areas' : 'Booking Scope: Whole Floor'}
        sx={{ mt: 1.5 }}
      />

      {room?.floors && room.floors.length > 0 ? (
        <TextField
          select
          fullWidth
          size="small"
          label="Floor"
          value={resolvedFloor?.id ?? ''}
          onChange={(event) => onFloorChange?.(event.target.value)}
          sx={{ mt: 1.5 }}
        >
          {room.floors.map((floor) => (
            <MenuItem key={floor.id} value={floor.id}>
              {floor.floor_name} • {floor.price ?? room.price} TND/hour • {floor.capacity} seats
            </MenuItem>
          ))}
        </TextField>
      ) : null}

      {bookingType === 'SELECTED_AREAS' ? (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            Selected Areas
          </Typography>
          {selectedAreaOptions.length ? (
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {selectedAreaOptions.map((area) => (
                <Chip
                  key={area.key}
                  size="small"
                  label={`${area.label} • ${area.price} TND/hour${area.includes?.length ? ` • ${area.includes.join(' / ')}` : ''}`}
                  variant="outlined"
                />
              ))}
            </Stack>
          ) : (
            <Box sx={{ mt: 0.5 }}>
              <Typography color="warning.main" variant="body2">
                No area selected yet. Go back and pick one or more areas from the floor.
              </Typography>
            </Box>
          )}
        </Stack>
      ) : null}
    </Paper>
  )
}
