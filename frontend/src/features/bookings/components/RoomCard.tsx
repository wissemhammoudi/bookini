import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'

import type { Room } from '../constants'

interface RoomCardProps {
  room: Room & { cover_image?: string | null; admin_id?: string | null }
  isLight: boolean
  isSelected?: boolean
  onBookNow: (room: Room) => void
  onViewAdmin?: (adminId: string) => void
  actionLabel?: string
}

export const RoomCard = ({
  room,
  isLight,
  isSelected = false,
  onBookNow,
  onViewAdmin,
  actionLabel,
}: RoomCardProps) => {
  // Fallback to emoji if no cover image
  const hasImage = room.cover_image && room.cover_image.trim()

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
        overflow: 'hidden',
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
      {/* Image Section */}
      {hasImage ? (
        <CardMedia
          component="img"
          height="200"
          image={room.cover_image ?? undefined}
          alt={room.name}
          sx={{
            objectFit: 'cover',
            backgroundColor: isLight ? 'rgba(0, 89, 179, 0.05)' : 'rgba(0, 89, 179, 0.1)',
          }}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            backgroundColor: isLight ? 'rgba(0, 89, 179, 0.05)' : 'rgba(0, 89, 179, 0.1)',
          }}
        >
          {room.image}
        </Box>
      )}

      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {room.name}
            </Typography>
            {isSelected ? (
              <Chip label="Selected" color="primary" size="small" sx={{ fontWeight: 700, alignSelf: 'flex-start' }} />
            ) : null}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <PeopleIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                Up to {room.capacity} people
              </Typography>
            </Stack>
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
            <Stack direction="row" spacing={1}>

              {room.admin_id && onViewAdmin ? (
                <Button
                  variant="text"
                  sx={{ fontWeight: 700 }}
                  onClick={() => onViewAdmin(room.admin_id as string)}
                >
                  View Owner
                </Button>
              ) : null}

              <Button
                variant={isSelected ? 'contained' : 'outlined'}
                sx={{ fontWeight: 700 }}
                onClick={() => onBookNow(room)}
              >
                {actionLabel ?? (isSelected ? 'Book Now' : 'Select Space')}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
