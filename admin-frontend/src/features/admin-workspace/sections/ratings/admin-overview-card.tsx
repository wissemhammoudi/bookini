import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material'

type SpaceSummary = {
  name: string
  average_rating: number
}

type AdminOverviewCardProps = {
  adminName: string
  averageRating: number
  ratingCount: number
  spacesCount: number
  topRatedFloor: SpaceSummary | null
}

export function AdminOverviewCard({
  adminName,
  averageRating,
  ratingCount,
  spacesCount,
  topRatedFloor,
}: AdminOverviewCardProps) {
  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Admin Overview
            </Typography>
            <Typography color="text.secondary">{adminName}</Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip label={`Avg rating ${averageRating.toFixed(1)}`} variant="outlined" />
            <Chip label={`${ratingCount} total ratings`} variant="outlined" />
            <Chip label={`${spacesCount} spaces`} variant="outlined" />
          </Stack>
        </Stack>
        {topRatedFloor ? (
          <Typography sx={{ mt: 1.5 }} color="text.secondary">
            Top rated space: {topRatedFloor.name} ({topRatedFloor.average_rating.toFixed(1)})
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}
