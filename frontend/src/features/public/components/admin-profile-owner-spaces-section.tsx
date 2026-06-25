import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import type { AdminProfile, FloorReview } from '@/lib/api'
import type { FloorFormState } from '@/features/public/admin-profile-page'

const RatingFilterOptions = () => {
  return (
    <>
      <MenuItem value={0}>All</MenuItem>
      <MenuItem value={5}>5 stars</MenuItem>
      <MenuItem value={4}>4+ stars</MenuItem>
      <MenuItem value={3}>3+ stars</MenuItem>
      <MenuItem value={2}>2+ stars</MenuItem>
      <MenuItem value={1}>1+ stars</MenuItem>
    </>
  )
}

export const OwnerSpacesSection = ({
  profile,
  selectedFloorId,
  floorForms,
  floorReviewItems,
  floorReviewsPage,
  floorReviewsMinFilter,
  canGoNextFloorReviews,
  onFloorReviewsPageChange,
  onFloorReviewsMinFilterChange,
  onFloorFormChange,
  onSaveFloorReview,
  onDeleteFloorReview,
  onViewReviews,
  isSavingFloorReview,
  isDeletingFloorReview,
}: {
  profile: AdminProfile
  selectedFloorId: string | null
  floorForms: Record<string, FloorFormState>
  floorReviewItems: FloorReview[]
  floorReviewsPage: number
  floorReviewsMinFilter: number
  canGoNextFloorReviews: boolean
  onFloorReviewsPageChange: (next: number) => void
  onFloorReviewsMinFilterChange: (value: number) => void
  onFloorFormChange: (floorId: string, next: FloorFormState) => void
  onSaveFloorReview: (floorId: string) => void
  onDeleteFloorReview: (floorId: string) => void
  onViewReviews: (floorId: string) => void
  isSavingFloorReview: boolean
  isDeletingFloorReview: boolean
}) => {
  const selectedFloor = profile.spaces.find((space) => space.id === selectedFloorId) ?? null

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>
        Spaces by this owner
      </Typography>

      <Grid container spacing={2.5}>
        {profile.spaces.map((space) => {
          const floorForm = floorForms[space.id] ?? { rating: 5, comment: '' }
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
                      onChange={(_, value) => onFloorFormChange(space.id, { ...floorForm, rating: value ?? 5 })}
                    />
                    <TextField
                      label="Comment"
                      minRows={2}
                      multiline
                      value={floorForm.comment}
                      onChange={(event) => onFloorFormChange(space.id, { ...floorForm, comment: event.target.value })}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" onClick={() => onSaveFloorReview(space.id)} disabled={isSavingFloorReview}>
                        Save review
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => onDeleteFloorReview(space.id)} disabled={isDeletingFloorReview}>
                        Delete my review
                      </Button>
                      <Button variant="text" onClick={() => onViewReviews(space.id)}>
                        View reviews
                      </Button>
                    </Stack>

                    {isSelected ? (
                      <Box sx={{ mt: 1 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, flex: 1 }}>
                            Reviews • {selectedFloor ? selectedFloor.rating_count : 0}
                          </Typography>
                          <TextField
                            select
                            label="Min rating"
                            size="small"
                            value={floorReviewsMinFilter}
                            onChange={(event) => {
                              onFloorReviewsPageChange(0)
                              onFloorReviewsMinFilterChange(Number(event.target.value))
                            }}
                            sx={{ width: { xs: '100%', sm: 150 } }}
                          >
                            <RatingFilterOptions />
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
                          {selectedFloor && !floorReviewItems.length ? <Alert severity="info">No reviews for this space yet.</Alert> : null}
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              disabled={floorReviewsPage === 0}
                              onClick={() => onFloorReviewsPageChange(Math.max(0, floorReviewsPage - 1))}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              disabled={!canGoNextFloorReviews}
                              onClick={() => onFloorReviewsPageChange(floorReviewsPage + 1)}
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
    </>
  )
}
