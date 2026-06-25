import { Alert, Box, Button, Card, CardContent, Divider, Rating, Stack, Typography } from '@mui/material'

import { RatingFilterSelect } from '@/features/admin-workspace/sections/ratings/rating-filter-select'

type AdminRatingItem = {
  id: string
  rating: number
  created_at: string
  comment?: string | null
}

type AdminRatingsCardProps = {
  ratings: AdminRatingItem[]
  minFilter: number
  onMinFilterChange: (value: number) => void
  page: number
  onPreviousPage: () => void
  onNextPage: () => void
  canGoNext: boolean
  totalCount: number
}

export function AdminRatingsCard({
  ratings,
  minFilter,
  onMinFilterChange,
  page,
  onPreviousPage,
  onNextPage,
  canGoNext,
  totalCount,
}: AdminRatingsCardProps) {
  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
          Latest Admin Rating
        </Typography>

        <RatingFilterSelect
          label="Minimum rating"
          value={minFilter}
          onChange={onMinFilterChange}
          marginBottom={1.5}
        />

        <Stack spacing={1.2}>
          {ratings.map((item) => (
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

          {!ratings.length ? <Alert severity="info">No admin ratings yet.</Alert> : null}

          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Total ratings: {totalCount}
            </Typography>
            <Button variant="outlined" size="small" disabled={page === 0} onClick={onPreviousPage}>
              Previous
            </Button>
            <Button variant="outlined" size="small" disabled={!canGoNext} onClick={onNextPage}>
              Next
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
