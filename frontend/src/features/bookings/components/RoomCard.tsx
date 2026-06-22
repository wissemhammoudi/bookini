import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'

import type { Room } from '../constants'

interface RoomCardProps {
  room: Room
  isLight: boolean
  isSelected?: boolean
  onBookNow: (room: Room) => void
  actionLabel?: string
}

export const RoomCard = ({ room, isLight, isSelected = false, onBookNow, actionLabel }: RoomCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: isSelected
          ? 'primary.main'
          : isLight
            ? 'rgba(0, 89, 179, 0.08)'
            : 'rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
        transition: 'all 0.3s',
        boxShadow: isSelected
          ? isLight
            ? '0 10px 22px rgba(0, 89, 179, 0.16)'
            : '0 10px 22px rgba(0, 89, 179, 0.24)'
          : 'none',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-4px)',
          boxShadow: isLight
            ? '0 12px 24px rgba(0, 89, 179, 0.08)'
            : '0 12px 24px rgba(0, 89, 179, 0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'start' }}>
            <Box sx={{ fontSize: '2.5rem' }}>{room.image}</Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {room.name}
              </Typography>
              {isSelected ? (
                <Chip label="Selected" color="primary" size="small" sx={{ mt: 1, fontWeight: 700 }} />
              ) : null}
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
                <PeopleIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Up to {room.capacity} people
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {room.amenities.map((amenity) => (
              <Chip
                key={amenity}
                label={amenity}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>

          <Divider sx={{ borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)' }} />

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                €{room.price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                per hour
              </Typography>
            </Stack>
            <Button
              variant={isSelected ? 'contained' : 'outlined'}
              sx={{ fontWeight: 700 }}
              onClick={() => onBookNow(room)}
            >
              {actionLabel ?? (isSelected ? 'Book Now' : 'Select Space')}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
