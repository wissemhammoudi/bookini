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
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import { PublicPageHeader } from '@/features/public/components/public-page-header'
import { PublicFooter } from '@/features/public/components/public-footer'
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
  const rooms = useMemo(() => roomsQuery.data ?? [], [roomsQuery.data])

  const [search, setSearch] = useState('')
  const [capacityFilter, setCapacityFilter] = useState<'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE'>('ALL')
  const [organizationFilter, setOrganizationFilter] = useState('ALL')
  const [spaceFilter, setSpaceFilter] = useState('ALL')


  const allOrganizations = useMemo(() => {
    const orgs = new Map<string, { name: string; description?: string; logo?: string; address?: string }>()
    rooms.forEach((room) => {
      if (room.organization_id && room.organization_name && !orgs.has(room.organization_id)) {
        orgs.set(room.organization_id, {
          name: room.organization_name,
          description: room.description,
          address: room.address,
        })
      }
    })
    return Array.from(orgs.entries()).map(([id, info]) => ({ id, ...info }))
  }, [rooms])

  const allSpaces = useMemo(() => {
    const filteredByOrg = organizationFilter === 'ALL' 
      ? rooms 
      : rooms.filter(room => room.organization_id === organizationFilter)
    
    return filteredByOrg.map((room) => ({ id: room.id, name: room.name }))
  }, [rooms, organizationFilter])

  const handleOrganizationChange = (val: string) => {
    setOrganizationFilter(val)
    setSpaceFilter('ALL')
  }

  const handleSpaceChange = (val: string) => {
    setSpaceFilter(val)
  }

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

      const matchesOrganization = organizationFilter === 'ALL' || room.organization_id === organizationFilter

      const matchesSpace = spaceFilter === 'ALL' || room.id === Number(spaceFilter)

      return matchesSearch && matchesCapacity && matchesOrganization && matchesSpace
    })
  }, [rooms, search, capacityFilter, organizationFilter, spaceFilter])

  const openPlacePage = (roomId: number) => {
    navigate(`/book/place/${roomId}`)
  }

  const openAdminProfile = (adminId: string) => {
    navigate(`/admins/${adminId}`)
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

      <PublicPageHeader
        isLight={isLight}
        eyebrow="Live Availability"
        title={
          <>
            Professional{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #1e293b 0%, #64748b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Space Booking
            </Box>
          </>
        }
        description="Explore our curated spaces, review real-time calendar availability, and submit your booking request in a few clicks."
      >
        <Chip label={`${rooms.length} places available`} color="primary" variant="filled" sx={{ fontWeight: 700 }} />
      </PublicPageHeader>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={6}>


          {/* Rooms Section */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Available Places
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
                    Filter Places
                  </Typography>
                  <Chip label={`${filteredRooms.length} result${filteredRooms.length === 1 ? '' : 's'}`} size="small" variant="outlined" />
                </Stack>

                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                    <TextField
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name"
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
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 }, flex: 1 }}>
                      <InputLabel>Organization</InputLabel>
                      <Select
                        value={organizationFilter}
                        label="Organization"
                        onChange={(e) => handleOrganizationChange(e.target.value as string)}
                      >
                        <MenuItem value="ALL">All organizations</MenuItem>
                        {allOrganizations.map((org) => (
                          <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 }, flex: 1 }}>
                      <InputLabel>Place</InputLabel>
                      <Select
                        value={spaceFilter}
                        label="Place"
                        onChange={(e) => handleSpaceChange(e.target.value as string)}
                      >
                        <MenuItem value="ALL">All places</MenuItem>
                        {allSpaces.map((space) => (
                          <MenuItem key={space.id} value={space.id.toString()}>{space.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
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
                    onViewAdmin={(adminId) => openAdminProfile(adminId)}
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
                <Typography sx={{ fontWeight: 700 }}>No matching places found</Typography>
                <Typography color="text.secondary">
                  Try changing your filters or search term to see more places.
                </Typography>
              </Paper>
            ) : null}
          </Box>
        </Stack>
      </Container>

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
