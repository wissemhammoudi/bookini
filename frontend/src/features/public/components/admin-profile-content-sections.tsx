import {
  Alert,
  Avatar,
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

import type { AdminProfile, AdminRating } from '@/lib/api'

const profileAvatarLabel = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

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

export const OwnerProfileCard = ({ profile }: { profile: AdminProfile }) => {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
          <Avatar src={profile.admin.avatar_url ?? undefined} sx={{ width: 72, height: 72, fontWeight: 800 }}>
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
  )
}

export const OwnerRatingEditorCard = ({
  adminRating,
  adminComment,
  onAdminRatingChange,
  onAdminCommentChange,
  onSaveAdminRating,
  onDeleteAdminRating,
  isSavingAdminRating,
  isDeletingAdminRating,
}: {
  adminRating: number
  adminComment: string
  onAdminRatingChange: (value: number) => void
  onAdminCommentChange: (value: string) => void
  onSaveAdminRating: () => void
  onDeleteAdminRating: () => void
  isSavingAdminRating: boolean
  isDeletingAdminRating: boolean
}) => {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Rate This Owner
          </Typography>
          <Rating value={adminRating} onChange={(_, value) => onAdminRatingChange(value ?? 5)} precision={1} />
          <TextField
            label="Comment"
            value={adminComment}
            onChange={(event) => onAdminCommentChange(event.target.value)}
            minRows={3}
            multiline
          />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" disabled={isSavingAdminRating} onClick={onSaveAdminRating}>
              Save rating
            </Button>
            <Button variant="outlined" color="error" disabled={isDeletingAdminRating} onClick={onDeleteAdminRating}>
              Delete my rating
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export const OwnerRatingsListCard = ({
  adminRatingsItems,
  adminRatingsPage,
  adminRatingsMinFilter,
  canGoNextAdminRatings,
  onAdminRatingsPageChange,
  onAdminRatingsMinFilterChange,
}: {
  adminRatingsItems: AdminRating[]
  adminRatingsPage: number
  adminRatingsMinFilter: number
  canGoNextAdminRatings: boolean
  onAdminRatingsPageChange: (next: number) => void
  onAdminRatingsMinFilterChange: (value: number) => void
}) => {
  return (
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
              onAdminRatingsPageChange(0)
              onAdminRatingsMinFilterChange(Number(event.target.value))
            }}
            sx={{ width: { xs: '100%', sm: 180 } }}
          >
            <RatingFilterOptions />
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
          {!adminRatingsItems.length ? <Alert severity="info">No ratings yet.</Alert> : null}
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              disabled={adminRatingsPage === 0}
              onClick={() => onAdminRatingsPageChange(Math.max(0, adminRatingsPage - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={!canGoNextAdminRatings}
              onClick={() => onAdminRatingsPageChange(adminRatingsPage + 1)}
            >
              Next
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

