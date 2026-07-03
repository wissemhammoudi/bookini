import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Chip,
  Card,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import { useNavigate, useParams } from 'react-router-dom'

import { useColorMode } from '@/app/use-color-mode'
import { PublicFooter } from '@/features/public/components/public-footer'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import type { PublicRoom } from '@/lib/api'
import { listPublicRooms } from '@/lib/api'
import { resolveMediaUrl, toEmbedVideoUrl } from './media-utils'

const buildMedia = (room: PublicRoom) => {
  const images = [room.cover_image, ...(room.gallery ?? [])]
    .filter((item): item is string => Boolean(item))
    .map((item) => resolveMediaUrl(item))
    .filter(Boolean)
    .slice(0, 3)

  const videos = room.video_url ? [toEmbedVideoUrl(room.video_url)].filter(Boolean) : []

  return {
    images: images.length > 0 ? images : ['/navbar_logo.png'],
    videos,
  }
}

export const PlaceDetailsPage = () => {
  const navigate = useNavigate()
  const { roomId = '' } = useParams()
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  const roomsQuery = useQuery({
    queryKey: ['public-rooms-catalog'],
    queryFn: listPublicRooms,
  })

  const room = useMemo(() => {
    return (roomsQuery.data ?? []).find((item) => item.id === Number.parseInt(roomId, 10)) ?? null
  }, [roomsQuery.data, roomId])

  useEffect(() => {
    if (room && room.floors && room.floors.length === 1) {
      navigate(`/book/place/${roomId}/floor/${room.floors[0].id}`, { replace: true })
    }
  }, [room, roomId, navigate])

  const media = useMemo(() => (room ? buildMedia(room) : { images: [], videos: [] }), [room])

  if (roomsQuery.isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar isLight={isLight} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="info">Loading place details...</Alert>
        </Container>
        <PublicFooter isLight={isLight} />
      </Box>
    )
  }

  if (!room) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar isLight={isLight} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Stack spacing={2}>
            <Alert severity="error">Place not found.</Alert>
            <Button variant="outlined" onClick={() => navigate('/book')}>Back to spaces</Button>
          </Stack>
        </Container>
        <PublicFooter isLight={isLight} />
      </Box>
    )
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

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack spacing={4}>
          <Stack direction="row" spacing={1} sx={{ alignSelf: 'flex-start' }}>
            <Button variant="outlined" onClick={() => navigate('/book')}>
              Back to spaces
            </Button>
            {room.admin_id ? (
              <Button variant="text" onClick={() => navigate(`/admins/${room.admin_id}`)}>
                View owner
              </Button>
            ) : null}
          </Stack>

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
                label="Space Details"
                color="primary"
                variant="outlined"
                sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
              />
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                {room.name}
              </Typography>
              <Typography color="text.secondary" variant="h6">
                Capacity {room.capacity} people • From {room.price || (room.floors?.[0]?.price ?? 0)} TND/hour
              </Typography>
              {room.description ? (
                <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                  {room.description}
                </Typography>
              ) : null}
              {room.address ? (
                <Typography variant="body2" color="text.secondary">
                  {room.address}
                </Typography>
              ) : null}
              {room.availability ? (
                <Chip label={room.availability} size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
              ) : null}
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {(room.features ?? room.amenities).map((amenity) => (
                  <Chip key={amenity} label={amenity} size="small" variant="outlined" />
                ))}
              </Stack>
            </Stack>
          </Paper>

          {room.floors && room.floors.length > 1 ? (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Select a Floor
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Select one of the available floors below to check layout areas, check availability, and book.
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  {room.floors.map((floor) => (
                    <Grid key={floor.id} size={{ xs: 12, md: 6 }}>
                      <Card
                        elevation={0}
                        variant="outlined"
                        onClick={() => navigate(`/book/place/${roomId}/floor/${floor.id}`)}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          cursor: 'pointer',
                          backgroundColor: isLight ? '#ffffff' : 'rgba(10, 14, 26, 0.45)',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                          borderColor: 'divider',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <Stack spacing={2}>
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {floor.floor_name}
                            </Typography>
                            <Chip label={`Floor ${floor.floor_number}`} color="primary" size="small" variant="outlined" />
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                            {floor.description || 'No description available for this floor.'}
                          </Typography>
                          <Divider />
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {floor.price ?? room.price} TND/hour
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Capacity: {floor.capacity} people
                            </Typography>
                          </Stack>
                          <Button variant="contained" size="small" fullWidth sx={{ mt: 1 }}>
                            View Floor & Book
                          </Button>
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Paper>
          ) : null}

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <PhotoLibraryOutlinedIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Images
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                }}
              >
                <Box
                  component="img"
                  src={media.images[0]}
                  alt={`${room.name} main`}
                  sx={{ width: '100%', height: { xs: 220, md: 360 }, objectFit: 'cover', borderRadius: 2 }}
                />
                <Stack spacing={1.5}>
                  <Box
                    component="img"
                    src={media.images[1] ?? media.images[0]}
                    alt={`${room.name} secondary 1`}
                    sx={{ width: '100%', height: { xs: 140, md: 172 }, objectFit: 'cover', borderRadius: 2 }}
                  />
                  <Box
                    component="img"
                    src={media.images[2] ?? media.images[0]}
                    alt={`${room.name} secondary 2`}
                    sx={{ width: '100%', height: { xs: 140, md: 172 }, objectFit: 'cover', borderRadius: 2 }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Paper>

          {media.videos.length > 0 ? (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <VideoLibraryOutlinedIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Video Tour
                  </Typography>
                </Stack>
                <Box
                  component="iframe"
                  src={media.videos[0]}
                  title={`${room.name} video tour`}
                  sx={{ width: '100%', height: { xs: 220, md: 420 }, border: 0, borderRadius: 2 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Container>

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
