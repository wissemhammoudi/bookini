import { Alert, Box, Button, Card, CardContent, MenuItem, Rating, Stack, TextField, Typography } from '@mui/material'

import { RatingFilterSelect } from '@/features/admin-workspace/sections/ratings/rating-filter-select'

type SpaceOption = {
  id: string
  name: string
}

type ReviewItem = {
  id: string
  rating: number
  created_at: string
  comment?: string | null
}

type SpaceReviewsCardProps = {
  spaces: SpaceOption[]
  selectedFloorId: string
  onSelectFloor: (id: string) => void
  reviews: ReviewItem[]
  averageRating?: number
  ratingCount?: number
  minFilter: number
  onMinFilterChange: (value: number) => void
  page: number
  onPreviousPage: () => void
  onNextPage: () => void
  canGoNext: boolean
}

export function SpaceReviewsCard({
  spaces,
  selectedFloorId,
  onSelectFloor,
  reviews,
  averageRating,
  ratingCount,
  minFilter,
  onMinFilterChange,
  page,
  onPreviousPage,
  onNextPage,
  canGoNext,
}: SpaceReviewsCardProps) {
  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Space Reviews
          </Typography>

          <TextField select label="Select space" value={selectedFloorId} onChange={(event) => onSelectFloor(event.target.value)} fullWidth>
            {spaces.map((space) => (
              <MenuItem key={space.id} value={space.id}>
                {space.name}
              </MenuItem>
            ))}
          </TextField>

          {selectedFloorId ? (
            <Stack spacing={1.2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  Average {Number(averageRating ?? 0).toFixed(1)} • {ratingCount ?? 0} reviews
                </Typography>

                <RatingFilterSelect
                  label="Min rating"
                  value={minFilter}
                  onChange={onMinFilterChange}
                  width={{ xs: '100%', sm: 150 }}
                />
              </Stack>

              {reviews.map((review) => (
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

              {!reviews.length ? <Alert severity="info">No reviews for this space.</Alert> : null}

              <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                <Button variant="outlined" size="small" disabled={page === 0} onClick={onPreviousPage}>
                  Previous
                </Button>
                <Button variant="outlined" size="small" disabled={!canGoNext} onClick={onNextPage}>
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
  )
}
