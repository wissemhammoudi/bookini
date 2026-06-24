import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { SectionHeader } from '@/features/admin-workspace/admin-workspace-utils'
import {
  getAdminPublicProfile,
  getCurrentUserProfile,
  listAdminRatingsByAdmin,
  listFloorReviewsByFloor,
} from '@/lib/api'

export const RatingsSection = () => {
  const [selectedFloorId, setSelectedFloorId] = useState<string>('')
  const [adminRatingsPage, setAdminRatingsPage] = useState(0)
  const [adminRatingsMinFilter, setAdminRatingsMinFilter] = useState(0)
  const [floorReviewsPage, setFloorReviewsPage] = useState(0)
  const [floorReviewsMinFilter, setFloorReviewsMinFilter] = useState(0)

  const adminRatingsLimit = 8
  const floorReviewsLimit = 8

  const currentUserQuery = useQuery({
    queryKey: ['workspace-current-user'],
    queryFn: getCurrentUserProfile,
  })

  const adminId = currentUserQuery.data?.id ?? ''

  const profileQuery = useQuery({
    queryKey: ['workspace-admin-profile', adminId],
    queryFn: () => getAdminPublicProfile(adminId),
    enabled: Boolean(adminId),
  })

  const adminRatingsQuery = useQuery({
    queryKey: [
      'workspace-admin-ratings',
      adminId,
      adminRatingsPage,
      adminRatingsMinFilter,
    ],
    queryFn: () =>
      listAdminRatingsByAdmin(adminId, {
        limit: adminRatingsLimit,
        offset: adminRatingsPage * adminRatingsLimit,
        min_rating: adminRatingsMinFilter > 0 ? adminRatingsMinFilter : undefined,
      }),
    enabled: Boolean(adminId),
  })

  const floorReviewsQuery = useQuery({
    queryKey: [
      'workspace-floor-reviews',
      selectedFloorId,
      floorReviewsPage,
      floorReviewsMinFilter,
    ],
    queryFn: () =>
      listFloorReviewsByFloor(selectedFloorId, {
        limit: floorReviewsLimit,
        offset: floorReviewsPage * floorReviewsLimit,
        min_rating: floorReviewsMinFilter > 0 ? floorReviewsMinFilter : undefined,
      }),
    enabled: Boolean(selectedFloorId),
  })

  const floorOptions = useMemo(() => profileQuery.data?.spaces ?? [], [profileQuery.data])
  const adminRatings = adminRatingsQuery.data?.items ?? []
  const canGoNextAdminRatings = adminRatings.length === adminRatingsLimit
  const floorReviews = floorReviewsQuery.data?.reviews ?? []
  const canGoNextFloorReviews = floorReviews.length === floorReviewsLimit

  const topRatedFloor = useMemo(() => {
    if (!floorOptions.length) {
      return null
    }

    return floorOptions.reduce((acc, item) => {
      if (!acc) {
        return item
      }
      return item.average_rating > acc.average_rating ? item : acc
    }, floorOptions[0])
  }, [floorOptions])

  if (currentUserQuery.isLoading || profileQuery.isLoading) {
    return <Alert severity="info">Loading ratings workspace...</Alert>
  }

  if (currentUserQuery.isError || profileQuery.isError || !profileQuery.data) {
    return <Alert severity="error">Could not load ratings data for this admin account.</Alert>
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Ratings & Reviews"
        description="Monitor your admin reputation and customer feedback for each space."
      />

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Admin Overview
              </Typography>
              <Typography color="text.secondary">{profileQuery.data.admin.full_name}</Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip label={`Avg rating ${profileQuery.data.average_rating.toFixed(1)}`} variant="outlined" />
              <Chip label={`${profileQuery.data.rating_count} total ratings`} variant="outlined" />
              <Chip label={`${profileQuery.data.spaces.length} spaces`} variant="outlined" />
            </Stack>
          </Stack>
          {topRatedFloor ? (
            <Typography sx={{ mt: 1.5 }} color="text.secondary">
              Top rated space: {topRatedFloor.name} ({topRatedFloor.average_rating.toFixed(1)})
            </Typography>
          ) : null}
        </CardContent>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
            Latest Admin Ratings
          </Typography>

          <TextField
            select
            label="Minimum rating"
            size="small"
            sx={{ width: { xs: '100%', sm: 180 }, mb: 1.5 }}
            value={adminRatingsMinFilter}
            onChange={(event) => {
              setAdminRatingsPage(0)
              setAdminRatingsMinFilter(Number(event.target.value))
            }}
          >
            <MenuItem value={0}>All</MenuItem>
            <MenuItem value={5}>5 stars</MenuItem>
            <MenuItem value={4}>4+ stars</MenuItem>
            <MenuItem value={3}>3+ stars</MenuItem>
            <MenuItem value={2}>2+ stars</MenuItem>
            <MenuItem value={1}>1+ stars</MenuItem>
          </TextField>

          <Stack spacing={1.2}>
            {adminRatings.map((item) => (
              <Box key={item.id}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Rating value={item.rating} readOnly size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Typography>
                </Stack>
                {item.comment ? (
                  <Typography variant="body2" color="text.secondary">
                    {item.comment}
                  </Typography>
                ) : null}
                <Divider sx={{ mt: 1 }} />
              </Box>
            ))}

            {!adminRatings.length ? (
              <Alert severity="info">No admin ratings yet.</Alert>
            ) : null}

            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                Total ratings: {adminRatingsQuery.data?.rating_count ?? 0}
              </Typography>
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

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Space Reviews
            </Typography>
            <TextField
              select
              label="Select space"
              value={selectedFloorId}
              onChange={(event) => {
                setSelectedFloorId(event.target.value)
                setFloorReviewsPage(0)
                setFloorReviewsMinFilter(0)
              }}
              fullWidth
            >
              {floorOptions.map((space) => (
                <MenuItem key={space.id} value={space.id}>
                  {space.name}
                </MenuItem>
              ))}
            </TextField>

            {selectedFloorId && floorReviewsQuery.data ? (
              <Stack spacing={1.2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                    Average {floorReviewsQuery.data.average_rating.toFixed(1)} • {floorReviewsQuery.data.rating_count} reviews
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
                {floorReviews.map((review) => (
                  <Box key={review.id} sx={{ p: 1.2, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    {review.comment ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {review.comment}
                      </Typography>
                    ) : null}
                  </Box>
                ))}
                {!floorReviews.length ? (
                  <Alert severity="info">No reviews for this space.</Alert>
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
            ) : (
              <Alert severity="info">Choose a space to inspect its ratings and comments.</Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
