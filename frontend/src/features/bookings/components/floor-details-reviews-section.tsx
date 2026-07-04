import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import type { FloorReviewsResponse } from '@/lib/api'

type FloorDetailsReviewsSectionProps = {
  isLight: boolean
  floorRating: number
  floorComment: string
  floorReviewsPage: number
  floorReviewsMinFilter: number
  floorReviewsQuery: FloorReviewsResponse | undefined
  floorReviewsIsError: boolean
  canGoNextFloorReviews: boolean
  onFloorRatingChange: (value: number) => void
  onFloorCommentChange: (value: string) => void
  onSaveRating: () => void
  onDeleteRating: () => void
  onFloorReviewsPageChange: (next: number) => void
  onFloorReviewsMinFilterChange: (value: number) => void
}

export const FloorDetailsReviewsSection = ({
  isLight,
  floorRating,
  floorComment,
  floorReviewsPage,
  floorReviewsMinFilter,
  floorReviewsQuery,
  floorReviewsIsError,
  canGoNextFloorReviews,
  onFloorRatingChange,
  onFloorCommentChange,
  onSaveRating,
  onDeleteRating,
  onFloorReviewsPageChange,
  onFloorReviewsMinFilterChange,
}: FloorDetailsReviewsSectionProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
        background: isLight ? '#ffffff' : 'rgba(10, 14, 26, 0.45)',
      }}
    >
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Ratings & Comments
            </Typography>
            <Typography color="text.secondary" variant="body2">
              See what people said about this floor and leave your own rating.
            </Typography>
          </Box>
          <Stack spacing={0.5} sx={{ minWidth: 130 }}>
            <Typography variant="body2" color="text.secondary">
              Average rating
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              {floorReviewsQuery?.average_rating?.toFixed(1) ?? '0.0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {floorReviewsQuery?.rating_count ?? 0} reviews
            </Typography>
          </Stack>
        </Stack>

        {floorReviewsIsError ? <Alert severity="error">Could not load ratings and comments right now.</Alert> : null}

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Rate this floor
                  </Typography>
                  <Rating value={floorRating} onChange={(_, value) => onFloorRatingChange(value ?? 5)} precision={1} />
                  <TextField
                    label="Comment"
                    value={floorComment}
                    onChange={(event) => onFloorCommentChange(event.target.value)}
                    minRows={4}
                    multiline
                  />
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" disabled={false} onClick={onSaveRating}>
                      Save rating
                    </Button>
                    <Button variant="outlined" color="error" disabled={false} onClick={onDeleteRating}>
                      Delete my rating
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Recent comments
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
                  <TextField
                    select
                    label="Minimum rating"
                    size="small"
                    value={floorReviewsMinFilter}
                    onChange={(event) => onFloorReviewsMinFilterChange(Number(event.target.value))}
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
                  {(floorReviewsQuery?.reviews ?? []).map((review) => (
                    <Box key={review.id}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Rating value={review.rating} precision={1} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                      </Stack>
                      {review.comment ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {review.comment}
                        </Typography>
                      ) : null}
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}
                  {!(floorReviewsQuery?.reviews ?? []).length ? <Alert severity="info">No comments yet.</Alert> : null}
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  )
}
