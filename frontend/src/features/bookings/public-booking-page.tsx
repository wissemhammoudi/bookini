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
  Tabs,
  Tab,
  Avatar,
  Button,
} from '@mui/material'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import BusinessIcon from '@mui/icons-material/Business'
import LayersIcon from '@mui/icons-material/Layers'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'

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
  const rooms = roomsQuery.data ?? []

  const [search, setSearch] = useState('')
  const [capacityFilter, setCapacityFilter] = useState<'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE'>('ALL')
  const [amenityFilter, setAmenityFilter] = useState('ALL')
  const [organizationFilter, setOrganizationFilter] = useState('ALL')
  const [spaceFilter, setSpaceFilter] = useState('ALL')
  const [floorFilter, setFloorFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'hierarchy'>('grid')

  const allAmenities = useMemo(
    () => Array.from(new Set(rooms.flatMap((room) => room.amenities))).sort((a, b) => a.localeCompare(b)),
    [rooms],
  )

  const allOrganizations = useMemo(() => {
    const orgs = new Map<string, { name: string; description?: string; logo?: string; address?: string }>()
    orgs.set("org-atlas", {
      name: "Atlas Business Hub",
      description: "Premium coworking spaces for teams and enterprise events.",
      logo: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=200&q=80",
      address: "12 Riverside Avenue, Tunis"
    })
    orgs.set("org-marina", {
      name: "Marina Event Spaces",
      description: "Flexible venues for workshops, meetups, and private bookings.",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80",
      address: "44 Lac View, Tunis"
    })
    orgs.set("org-oasis", {
      name: "Oasis Studios",
      description: "Creative studios designed for production teams and content creators.",
      logo: "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=200&q=80",
      address: "9 Palm District, Sousse"
    })
    rooms.forEach((room) => {
      if (room.organization_id && room.organization_name && !orgs.has(room.organization_id)) {
        orgs.set(room.organization_id, {
          name: room.organization_name,
          description: "Professional workspaces and meeting rooms operator.",
          address: room.address || "Tunis, Tunisia"
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

  const allFloors = useMemo(() => {
    let targetRooms = rooms
    if (spaceFilter !== 'ALL') {
      targetRooms = rooms.filter(room => room.id === Number(spaceFilter))
    } else if (organizationFilter !== 'ALL') {
      targetRooms = rooms.filter(room => room.organization_id === organizationFilter)
    }

    const floorList = new Map<string, string>()
    targetRooms.forEach((room) => {
      if (room.floors) {
        room.floors.forEach((f) => {
          floorList.set(f.id, f.floor_name)
        })
      }
    })
    return Array.from(floorList.entries()).map(([id, name]) => ({ id, name }))
  }, [rooms, organizationFilter, spaceFilter])

  const handleOrganizationChange = (val: string) => {
    setOrganizationFilter(val)
    setSpaceFilter('ALL')
    setFloorFilter('ALL')
  }

  const handleSpaceChange = (val: string) => {
    setSpaceFilter(val)
    setFloorFilter('ALL')
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

      const matchesAmenity = amenityFilter === 'ALL' || room.amenities.includes(amenityFilter)

      const matchesOrganization = organizationFilter === 'ALL' || room.organization_id === organizationFilter

      const matchesSpace = spaceFilter === 'ALL' || room.id === Number(spaceFilter)

      const matchesFloor = floorFilter === 'ALL' || (room.floors && room.floors.some(f => f.id === floorFilter))

      return matchesSearch && matchesCapacity && matchesAmenity && matchesOrganization && matchesSpace && matchesFloor
    })
  }, [rooms, search, capacityFilter, amenityFilter, organizationFilter, spaceFilter, floorFilter])

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
        <Chip label={`${rooms.length} spaces available`} color="primary" variant="filled" sx={{ fontWeight: 700 }} />
      </PublicPageHeader>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={6}>


          {/* Rooms Section */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Available Spaces
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Use filters to find your ideal place, then open the place page for full details, media, and calendar booking.
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.08)', mb: 3 }}>
              <Tabs
                value={viewMode}
                onChange={(_, val) => setViewMode(val)}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 700,
                    textTransform: 'none',
                    minWidth: 150,
                  },
                }}
              >
                <Tab icon={<ViewModuleIcon sx={{ mr: 1 }} fontSize="small" />} iconPosition="start" label="All Spaces Grid" value="grid" />
                <Tab icon={<AccountTreeIcon sx={{ mr: 1 }} fontSize="small" />} iconPosition="start" label="Interactive Hierarchy Explorer" value="hierarchy" />
              </Tabs>
            </Box>

            {viewMode === 'grid' ? (
              <>
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

                    <Stack spacing={1.5}>
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
                          <InputLabel>Space</InputLabel>
                          <Select
                            value={spaceFilter}
                            label="Space"
                            onChange={(e) => handleSpaceChange(e.target.value as string)}
                          >
                            <MenuItem value="ALL">All spaces</MenuItem>
                            {allSpaces.map((space) => (
                              <MenuItem key={space.id} value={space.id.toString()}>{space.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 }, flex: 1 }}>
                          <InputLabel>Floor</InputLabel>
                          <Select
                            value={floorFilter}
                            label="Floor"
                            onChange={(e) => setFloorFilter(e.target.value as string)}
                          >
                            <MenuItem value="ALL">All floors</MenuItem>
                            {allFloors.map((floor) => (
                              <MenuItem key={floor.id} value={floor.id}>{floor.name}</MenuItem>
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
                    <Typography sx={{ fontWeight: 700 }}>No matching spaces found</Typography>
                    <Typography color="text.secondary">
                      Try changing your filters or search term to see more places.
                    </Typography>
                  </Paper>
                ) : null}
              </>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                  gap: 3,
                  alignItems: 'stretch',
                }}
              >
                {/* Column 1: Organizations */}
                <Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.06)',
                      background: isLight ? '#ffffff' : 'rgba(10, 14, 26, 0.45)',
                      height: '100%',
                      minHeight: 500,
                    }}
                  >
                    <Stack spacing={2.5}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <BusinessIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          Organizations
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Select an organization to view all its spaces.
                      </Typography>

                      <Stack spacing={1.5}>
                        {allOrganizations.map((org) => {
                          const isSelected = organizationFilter === org.id
                          const spaceCount = rooms.filter(r => r.organization_id === org.id).length
                          
                          return (
                            <Paper
                              key={org.id}
                              elevation={0}
                              onClick={() => handleOrganizationChange(isSelected ? 'ALL' : org.id)}
                              sx={{
                                p: 2,
                                borderRadius: 2.5,
                                border: '1.5px solid',
                                borderColor: isSelected
                                  ? 'primary.main'
                                  : isLight
                                    ? 'rgba(0, 89, 179, 0.06)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                background: isSelected
                                  ? isLight
                                    ? 'rgba(25, 118, 210, 0.04)'
                                    : 'rgba(25, 118, 210, 0.12)'
                                  : isLight
                                    ? 'rgba(0, 0, 0, 0.01)'
                                    : 'rgba(255, 255, 255, 0.02)',
                                cursor: 'pointer',
                                transition: 'all 0.25s',
                                '&:hover': {
                                  borderColor: isSelected ? 'primary.main' : 'primary.light',
                                  transform: 'translateY(-2px)',
                                  boxShadow: isLight
                                    ? '0 6px 12px rgba(0, 0, 0, 0.03)'
                                    : '0 6px 12px rgba(0, 0, 0, 0.2)',
                                },
                              }}
                            >
                              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                                <Avatar
                                  src={org.logo}
                                  alt={org.name}
                                  variant="rounded"
                                  sx={{ width: 44, height: 44, border: '1px solid divider', bgcolor: 'background.default' }}
                                >
                                  {org.name[0]}
                                </Avatar>
                                <Stack spacing={0.5} sx={{ flex: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    {org.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {org.description}
                                  </Typography>
                                  <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: 'center' }}>
                                    <Chip
                                      label={`${spaceCount} space${spaceCount === 1 ? '' : 's'}`}
                                      size="small"
                                      color={isSelected ? "primary" : "default"}
                                      variant={isSelected ? "filled" : "outlined"}
                                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                      · {org.address?.split(',')[1]?.trim() || "Tunis"}
                                    </Typography>
                                  </Stack>
                                </Stack>
                                <ArrowForwardIosIcon
                                  sx={{
                                    fontSize: 12,
                                    alignSelf: 'center',
                                    color: isSelected ? 'primary.main' : 'text.disabled',
                                    transform: isSelected ? 'rotate(90deg)' : 'none',
                                    transition: 'transform 0.2s',
                                  }}
                                />
                              </Stack>
                            </Paper>
                          )
                        })}
                      </Stack>
                    </Stack>
                  </Paper>
                </Box>

                {/* Column 2: Spaces */}
                <Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.06)',
                      background: isLight ? '#ffffff' : 'rgba(10, 14, 26, 0.45)',
                      height: '100%',
                      minHeight: 500,
                    }}
                  >
                    <Stack spacing={2.5}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <MeetingRoomIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          Spaces
                        </Typography>
                        {organizationFilter !== 'ALL' && (
                          <Chip
                            label="Filtered"
                            size="small"
                            color="info"
                            variant="outlined"
                            onDelete={() => handleOrganizationChange('ALL')}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Stack>

                      {organizationFilter === 'ALL' ? (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 6,
                            textAlign: 'center',
                            opacity: 0.85,
                          }}
                        >
                          <BusinessIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Select an Organization
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 200 }}>
                            Choose an organization on the left to see all operated spaces.
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1.5}>
                          {rooms
                            .filter((room) => room.organization_id === organizationFilter)
                            .map((room) => {
                              const isSelected = spaceFilter === room.id.toString()
                              const floorCount = room.floors?.length || 0
                              
                              return (
                                <Paper
                                  key={room.id}
                                  elevation={0}
                                  onClick={() => handleSpaceChange(isSelected ? 'ALL' : room.id.toString())}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2.5,
                                    border: '1.5px solid',
                                    borderColor: isSelected
                                      ? 'primary.main'
                                      : isLight
                                        ? 'rgba(0, 89, 179, 0.06)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                    background: isSelected
                                      ? isLight
                                        ? 'rgba(25, 118, 210, 0.04)'
                                        : 'rgba(25, 118, 210, 0.12)'
                                      : isLight
                                        ? 'rgba(0, 0, 0, 0.01)'
                                        : 'rgba(255, 255, 255, 0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s',
                                    '&:hover': {
                                      borderColor: isSelected ? 'primary.main' : 'primary.light',
                                      transform: 'translateY(-2px)',
                                      boxShadow: isLight
                                        ? '0 6px 12px rgba(0, 0, 0, 0.03)'
                                        : '0 6px 12px rgba(0, 0, 0, 0.2)',
                                    },
                                  }}
                                >
                                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                                    <Box
                                      sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        border: '1px solid divider',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                                      }}
                                    >
                                      {room.cover_image ? (
                                        <Box component="img" src={room.cover_image} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        <Typography variant="h5">{room.image}</Typography>
                                      )}
                                    </Box>
                                    <Stack spacing={0.5} sx={{ flex: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        {room.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Capacity: {room.capacity} people · €{room.price}/hr
                                      </Typography>
                                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                        <Chip
                                          label={`${floorCount} floor${floorCount === 1 ? '' : 's'}`}
                                          size="small"
                                          color={isSelected ? "primary" : "default"}
                                          variant={isSelected ? "filled" : "outlined"}
                                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                                        />
                                      </Stack>
                                    </Stack>
                                    <ArrowForwardIosIcon
                                      sx={{
                                        fontSize: 12,
                                        alignSelf: 'center',
                                        color: isSelected ? 'primary.main' : 'text.disabled',
                                        transform: isSelected ? 'rotate(90deg)' : 'none',
                                        transition: 'transform 0.2s',
                                      }}
                                    />
                                  </Stack>
                                </Paper>
                              )
                            })}
                        </Stack>
                      )}
                    </Stack>
                  </Paper>
                </Box>

                {/* Column 3: Floors */}
                <Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.06)',
                      background: isLight ? '#ffffff' : 'rgba(10, 14, 26, 0.45)',
                      height: '100%',
                      minHeight: 500,
                    }}
                  >
                    <Stack spacing={2.5}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <LayersIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          Floors
                        </Typography>
                        {spaceFilter !== 'ALL' && (
                          <Chip
                            label="Filtered"
                            size="small"
                            color="info"
                            variant="outlined"
                            onDelete={() => handleSpaceChange('ALL')}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Stack>

                      {spaceFilter === 'ALL' ? (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 6,
                            textAlign: 'center',
                            opacity: 0.85,
                          }}
                        >
                          <MeetingRoomIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Select a Space
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 200 }}>
                            Choose a physical workspace in the middle column to see all its floors.
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          {rooms
                            .find((r) => r.id.toString() === spaceFilter)
                            ?.floors?.map((floor) => {
                              const isSelected = floorFilter === floor.id
                              return (
                                <Paper
                                  key={floor.id}
                                  elevation={0}
                                  onClick={() => setFloorFilter(isSelected ? 'ALL' : floor.id)}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2.5,
                                    border: '1.5px solid',
                                    borderColor: isSelected
                                      ? 'primary.main'
                                      : isLight
                                        ? 'rgba(0, 89, 179, 0.06)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                    background: isSelected
                                      ? isLight
                                        ? 'rgba(25, 118, 210, 0.04)'
                                        : 'rgba(25, 118, 210, 0.12)'
                                      : isLight
                                        ? 'rgba(0, 0, 0, 0.01)'
                                        : 'rgba(255, 255, 255, 0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s',
                                    '&:hover': {
                                      borderColor: isSelected ? 'primary.main' : 'primary.light',
                                    },
                                  }}
                                >
                                  <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        {floor.floor_name}
                                      </Typography>
                                      <Chip
                                        label={`Lvl ${floor.floor_number}`}
                                        size="small"
                                        color="secondary"
                                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                                      />
                                    </Stack>

                                    {floor.description && (
                                      <Typography variant="caption" color="text.secondary">
                                        {floor.description}
                                      </Typography>
                                    )}

                                    {floor.reservation_areas && floor.reservation_areas.length > 0 && (
                                      <Stack spacing={0.75}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', fontSize: '0.65rem' }}>
                                          Reservation Zones
                                        </Typography>
                                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                          {floor.reservation_areas.map((area: string) => (
                                            <Chip
                                              key={area}
                                              label={area}
                                              size="small"
                                              sx={{ fontSize: '0.65rem', height: 18 }}
                                            />
                                          ))}
                                        </Stack>
                                      </Stack>
                                    )}
                                    
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      fullWidth
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        openPlacePage(Number(spaceFilter))
                                      }}
                                      sx={{ fontWeight: 700, textTransform: 'none', mt: 0.5 }}
                                    >
                                      View Space Details
                                    </Button>
                                  </Stack>
                                </Paper>
                              )
                            })}
                        </Stack>
                      )}
                    </Stack>
                  </Paper>
                </Box>
              </Box>
            )}
          </Box>
        </Stack>
      </Container>

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
