import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import { RoomCard } from './components/RoomCard'
import { listPublicRooms } from '@/lib/api'

/**
 * Public Booking Page
 * Allows users to browse subscription plans and book rooms
 *
 * Features:
 * - Select subscription plan (Pay-As-You-Go, Starter, Professional)
 * - Browse available rooms with amenities and pricing
 * - Book rooms with date, time, and guest information
 * - Real-time price calculation based on plan and duration
 */
export const PublicBookingPage = () => {
  const navigate = useNavigate()
  const { mode } = useColorMode()
  const isLight = mode === 'light'
  const roomsQuery = useQuery({
    queryKey: ['public-rooms-catalog'],
    queryFn: listPublicRooms,
  })
  const rooms = roomsQuery.data ?? []

  const [search, setSearch] = useState('')
  const [capacityFilter, setCapacityFilter] = useState<'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE'>('ALL')
  const [amenityFilter, setAmenityFilter] = useState('ALL')

  const allAmenities = useMemo(
    () => Array.from(new Set(rooms.flatMap((room) => room.amenities))).sort((a, b) => a.localeCompare(b)),
    [rooms],
  )

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        !search.trim()
        || room.name.toLowerCase().includes(search.trim().toLowerCase())
        || room.amenities.some((amenity) => amenity.toLowerCase().includes(search.trim().toLowerCase()))

      const matchesCapacity =
        capacityFilter === 'ALL'
        || (capacityFilter === 'SMALL' && room.capacity <= 6)
        || (capacityFilter === 'MEDIUM' && room.capacity > 6 && room.capacity <= 12)
        || (capacityFilter === 'LARGE' && room.capacity > 12)

      const matchesAmenity = amenityFilter === 'ALL' || room.amenities.includes(amenityFilter)

      return matchesSearch && matchesCapacity && matchesAmenity
    })
  }, [rooms, search, capacityFilter, amenityFilter])

  const openPlacePage = (roomId: number) => {
    navigate(`/book/place/${roomId}`)
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

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={8}>
          {/* Header */}
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
            <Stack spacing={2}>
              <Chip
                icon={<EventAvailableOutlinedIcon />}
                label="Live Availability"
                color="primary"
                variant="outlined"
                sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
              />
              <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                Professional Space Booking
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 760 }}>
                Explore our curated spaces, review real-time calendar availability, and submit your booking request in a few clicks.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <Chip label={`${rooms.length} spaces available`} color="primary" variant="filled" />
                <Chip label="Calendar synced with backend" variant="outlined" />
                <Chip label="Conflict checks enabled" variant="outlined" />
              </Stack>
            </Stack>
          </Paper>

          {/* Rooms Section */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Available Spaces
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Use filters to find your ideal place, then open the place page for full details, media, and calendar booking.
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.06)',
                background: isLight ? '#ffffff' : 'rgba(10, 14, 26, 0.45)',
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <FilterListOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Filter Spaces
                  </Typography>
                  <Chip label={`${filteredRooms.length} result${filteredRooms.length === 1 ? '' : 's'}`} size="small" variant="outlined" />
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                  <TextField
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or amenity"
                    fullWidth
                    size="small"
                    slotProps={{
                      input: {
                        startAdornment: <SearchOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />,
                      },
                    }}
                  />

                  <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 170 } }}>
                    <InputLabel>Capacity</InputLabel>
                    <Select
                      value={capacityFilter}
                      label="Capacity"
                      onChange={(event) => setCapacityFilter(event.target.value as 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE')}
                    >
                      <MenuItem value="ALL">All</MenuItem>
                      <MenuItem value="SMALL">1 - 6</MenuItem>
                      <MenuItem value="MEDIUM">7 - 12</MenuItem>
                      <MenuItem value="LARGE">13+</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 210 } }}>
                    <InputLabel>Amenity</InputLabel>
                    <Select
                      value={amenityFilter}
                      label="Amenity"
                      onChange={(event) => setAmenityFilter(event.target.value)}
                    >
                      <MenuItem value="ALL">All amenities</MenuItem>
                      {allAmenities.map((amenity) => (
                        <MenuItem key={amenity} value={amenity}>
                          {amenity}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Paper>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
                gap: 3,
              }}
            >
              {filteredRooms.map((room) => (
                <Box key={room.id}>
                  <RoomCard
                    room={room}
                    isLight={isLight}
                    onBookNow={() => openPlacePage(room.id)}
                    actionLabel="View Place"
                  />
                </Box>
              ))}
            </Box>

            {filteredRooms.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: isLight ? 'rgba(0, 89, 179, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>No matching spaces found</Typography>
                <Typography color="text.secondary">
                  Try changing your filters or search term to see more places.
                </Typography>
              </Paper>
            ) : null}
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
