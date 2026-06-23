import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  MenuItem,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useParams } from 'react-router-dom'

import { useColorMode } from '@/app/use-color-mode'
import { PublicFooter } from './components/public-footer'
import {
  deleteMyAdminRating,
  deleteMyFloorReview,
  getAdminProfile,
  listAdminRatings,
  listFloorReviews,
  upsertMyAdminRating,
  upsertMyFloorReview,
} from '@/lib/api'
import { PublicNavbar } from './components/public-navbar'

const profileAvatarLabel = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

type FloorFormState = {
  rating: number
  comment: string
}

export const AdminProfilePage = () => {
  const { adminId = '' } = useParams()
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  const [adminRating, setAdminRating] = useState(5)
  const [adminComment, setAdminComment] = useState('')
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null)
  const [floorForms, setFloorForms] = useState<Record<string, FloorFormState>>({})
  const [adminRatingsPage, setAdminRatingsPage] = useState(0)
  const [adminRatingsMinFilter, setAdminRatingsMinFilter] = useState(0)
  const [floorReviewsPage, setFloorReviewsPage] = useState(0)
  const [floorReviewsMinFilter, setFloorReviewsMinFilter] = useState(0)

  const adminRatingsLimit = 6
  const floorReviewsLimit = 5

  const profileQuery = useQuery({
    queryKey: ['admin-profile', adminId],
    queryFn: () => getAdminProfile(adminId),
    enabled: Boolean(adminId),
  })

  const adminRatingsQuery = useQuery({
    queryKey: [
      'admin-ratings',
      adminId,
      adminRatingsPage,
      adminRatingsMinFilter,
    ],
    queryFn: () =>
      listAdminRatings(adminId, {
        limit: adminRatingsLimit,
        offset: adminRatingsPage * adminRatingsLimit,
        min_rating: adminRatingsMinFilter > 0 ? adminRatingsMinFilter : undefined,
      }),
    enabled: Boolean(adminId),
  })

  const floorReviewsQuery = useQuery({
    queryKey: [
      'floor-reviews',
      selectedFloorId,
      floorReviewsPage,
      floorReviewsMinFilter,
    ],
    queryFn: () =>
      listFloorReviews(selectedFloorId ?? '', {
        limit: floorReviewsLimit,
        offset: floorReviewsPage * floorReviewsLimit,
        min_rating: floorReviewsMinFilter > 0 ? floorReviewsMinFilter : undefined,
      }),
    enabled: Boolean(selectedFloorId),
  })

  const upsertAdminRatingMutation = useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      upsertMyAdminRating(adminId, payload),
    onSuccess: async () => {
      await Promise.all([profileQuery.refetch(), adminRatingsQuery.refetch()])
      setAdminComment('')
      setAdminRating(5)
    },
  })

  const deleteAdminRatingMutation = useMutation({
    mutationFn: () => deleteMyAdminRating(adminId),
    onSuccess: async () => {
      await Promise.all([profileQuery.refetch(), adminRatingsQuery.refetch()])
    },
  })

  const upsertFloorReviewMutation = useMutation({
    mutationFn: ({ floorId, payload }: { floorId: string; payload: { rating: number; comment?: string } }) =>
      upsertMyFloorReview(floorId, payload),
    onSuccess: async (_, variables) => {
      if (selectedFloorId === variables.floorId) {
        await floorReviewsQuery.refetch()
      }
      await profileQuery.refetch()
      setFloorForms((prev) => ({
        ...prev,
        [variables.floorId]: { rating: 5, comment: '' },
      }))
    },
  })

  const deleteFloorReviewMutation = useMutation({
    mutationFn: (floorId: string) => deleteMyFloorReview(floorId),
    onSuccess: async (_, floorId) => {
      if (selectedFloorId === floorId) {
        await floorReviewsQuery.refetch()
      }
      await profileQuery.refetch()
    },
  })

  const selectedFloor = useMemo(() => {
    return profileQuery.data?.spaces.find((space) => space.id === selectedFloorId) ?? null
  }, [profileQuery.data?.spaces, selectedFloorId])

  const adminRatingsItems = adminRatingsQuery.data?.items ?? []
  const canGoNextAdminRatings = adminRatingsItems.length === adminRatingsLimit
  const floorReviewItems = floorReviewsQuery.data?.reviews ?? []
  const canGoNextFloorReviews = floorReviewItems.length === floorReviewsLimit

  const formForFloor = (floorId: string): FloorFormState => {
    return floorForms[floorId] ?? { rating: 5, comment: '' }
  }

  const setFormForFloor = (floorId: string, next: FloorFormState) => {
    setFloorForms((prev) => ({ ...prev, [floorId]: next }))
  }

  if (profileQuery.isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar isLight={isLight} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="info">Loading admin profile...</Alert>
        </Container>
        <PublicFooter isLight={isLight} />
      </Box>
    )
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar isLight={isLight} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">
            Could not load this owner profile. Make sure the owner exists.
          </Alert>
        </Container>
        <PublicFooter isLight={isLight} />
      </Box>
    )
  }

  const profile = profileQuery.data

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
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack spacing={3.5}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
                <Avatar
                  src={profile.admin.avatar_url ?? undefined}
                  sx={{ width: 72, height: 72, fontWeight: 800 }}
                >
                  {profileAvatarLabel(profile.admin.full_name)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                    Owner Profile
                  </Typography>
                  <Typography color="text.secondary">{profile.admin.email}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Chip label={profile.admin.role} color="primary" variant="outlined" />
                    <Chip label={`${profile.spaces.length} spaces`} variant="outlined" />
                    <Chip label={`${profile.rating_count} ratings`} variant="outlined" />
                  </Stack>
                </Box>

                <Stack spacing={0.5} sx={{ minWidth: 130 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average owner rating
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {profile.average_rating.toFixed(1)}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Rate This Owner
                    </Typography>
                    <Rating
                      value={adminRating}
                      onChange={(_, value) => setAdminRating(value ?? 5)}
                      precision={1}
                    />
                    <TextField
                      label="Comment"
                      value={adminComment}
                      onChange={(event) => setAdminComment(event.target.value)}
                      minRows={3}
                      multiline
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        disabled={upsertAdminRatingMutation.isPending}
                        onClick={() =>
                          upsertAdminRatingMutation.mutate({
                            rating: adminRating,
                            comment: adminComment.trim() || undefined,
                          })
                        }
                      >
                        Save rating
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        disabled={deleteAdminRatingMutation.isPending}
                        onClick={() => deleteAdminRatingMutation.mutate()}
                      >
                        Delete my rating
                      </Button>
                    </Stack>
                    {(upsertAdminRatingMutation.isError || deleteAdminRatingMutation.isError) ? (
                      <Alert severity="error">Could not save your owner rating. You need a completed reservation.</Alert>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Recent Owner Ratings
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      select
                      label="Minimum rating"
                      size="small"
                      value={adminRatingsMinFilter}
                      onChange={(event) => {
                        setAdminRatingsPage(0)
                        setAdminRatingsMinFilter(Number(event.target.value))
                      }}
                      sx={{ width: { xs: '100%', sm: 180 } }}
                    >
                      <MenuItem value={0}>All</MenuItem>
                      <MenuItem value={5}>5 stars</MenuItem>
                      <MenuItem value={4}>4+ stars</MenuItem>
                      <MenuItem value={3}>3+ stars</MenuItem>
                      <MenuItem value={2}>2+ stars</MenuItem>
                      <MenuItem value={1}>1+ stars</MenuItem>
                    </TextField>
                  </Stack>
                  <Stack spacing={1.5}>
                    {adminRatingsItems.map((ratingItem) => (
                      <Box key={ratingItem.id}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <Rating value={ratingItem.rating} precision={1} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(ratingItem.created_at).toLocaleDateString()}
                          </Typography>
                        </Stack>
                        {ratingItem.comment ? (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {ratingItem.comment}
                          </Typography>
                        ) : null}
                        <Divider sx={{ mt: 1 }} />
                      </Box>
                    ))}
                    {!adminRatingsItems.length ? (
                      <Alert severity="info">No ratings yet.</Alert>
                    ) : null}
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={adminRatingsPage === 0}
                        onClick={() => setAdminRatingsPage((prev) => Math.max(0, prev - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={!canGoNextAdminRatings}
                        onClick={() => setAdminRatingsPage((prev) => prev + 1)}
                      >
                        Next
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 900 }}>
        Spaces by this owner
          </Typography>

          <Grid container spacing={2.5}>
            {profile.spaces.map((space) => {
              const floorForm = formForFloor(space.id)
              const isSelected = selectedFloorId === space.id

              return (
                <Grid key={space.id} size={{ xs: 12, md: 6 }}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    <Box sx={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                      <Box
                        component="img"
                        src={space.cover_image || `https://picsum.photos/seed/${encodeURIComponent(space.name)}/800/500`}
                        alt={space.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {space.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {space.building} • Floor {space.floor_number} • Capacity {space.capacity}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                          <Chip label={space.status} size="small" variant="outlined" />
                          <Chip label={`Rating ${space.average_rating.toFixed(1)}`} size="small" variant="outlined" />
                          <Chip label={`${space.rating_count} reviews`} size="small" variant="outlined" />
                        </Stack>

                        <Divider />

                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Rate this space
                        </Typography>
                        <Rating
                          value={floorForm.rating}
                          onChange={(_, value) =>
                            setFormForFloor(space.id, {
                              ...floorForm,
                              rating: value ?? 5,
                            })
                          }
                        />
                        <TextField
                          label="Comment"
                          minRows={2}
                          multiline
                          value={floorForm.comment}
                          onChange={(event) =>
                            setFormForFloor(space.id, {
                              ...floorForm,
                              comment: event.target.value,
                            })
                          }
                        />
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            onClick={() =>
                              upsertFloorReviewMutation.mutate({
                                floorId: space.id,
                                payload: {
                                  rating: floorForm.rating,
                                  comment: floorForm.comment.trim() || undefined,
                                },
                              })
                            }
                            disabled={upsertFloorReviewMutation.isPending}
                          >
                            Save review
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => deleteFloorReviewMutation.mutate(space.id)}
                            disabled={deleteFloorReviewMutation.isPending}
                          >
                            Delete my review
                          </Button>
                          <Button
                            variant="text"
                            onClick={() => {
                              setFloorReviewsPage(0)
                              setFloorReviewsMinFilter(0)
                              setSelectedFloorId(space.id)
                            }}
                          >
                            View reviews
                          </Button>
                        </Stack>
                        {upsertFloorReviewMutation.isError || deleteFloorReviewMutation.isError ? (
                          <Alert severity="error">Review action failed. A completed reservation is required.</Alert>
                        ) : null}

                        {isSelected ? (
                          <Box sx={{ mt: 1 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, flex: 1 }}>
                                Reviews • {floorReviewsQuery.data?.rating_count ?? 0}
                              </Typography>
                              <TextField
                                select
                                label="Min rating"
                                size="small"
                                value={floorReviewsMinFilter}
                                onChange={(event) => {
                                  setFloorReviewsPage(0)
                                  setFloorReviewsMinFilter(Number(event.target.value))
                                }}
                                sx={{ width: { xs: '100%', sm: 150 } }}
                              >
                                <MenuItem value={0}>All</MenuItem>
                                <MenuItem value={5}>5 stars</MenuItem>
                                <MenuItem value={4}>4+ stars</MenuItem>
                                <MenuItem value={3}>3+ stars</MenuItem>
                                <MenuItem value={2}>2+ stars</MenuItem>
                                <MenuItem value={1}>1+ stars</MenuItem>
                              </TextField>
                            </Stack>
                            <Stack spacing={1}>
                              {floorReviewItems.map((item) => (
                                <Box key={item.id} sx={{ p: 1.2, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Rating value={item.rating} readOnly size="small" />
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(item.created_at).toLocaleDateString()}
                                    </Typography>
                                  </Stack>
                                  {item.comment ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      {item.comment}
                                    </Typography>
                                  ) : null}
                                </Box>
                              ))}
                              {selectedFloor && !floorReviewItems.length ? (
                                <Alert severity="info">No reviews for this space yet.</Alert>
                              ) : null}
                              <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  disabled={floorReviewsPage === 0}
                                  onClick={() => setFloorReviewsPage((prev) => Math.max(0, prev - 1))}
                                >
                                  Previous
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  disabled={!canGoNextFloorReviews}
                                  onClick={() => setFloorReviewsPage((prev) => prev + 1)}
                                >
                                  Next
                                </Button>
                              </Stack>
                            </Stack>
                          </Box>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Stack>
      </Container>

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
