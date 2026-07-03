import { Alert, MenuItem, Stack, TextField } from '@mui/material'

import { SectionHeader } from '@/features/admin-workspace/admin-workspace-utils'
import { AdminOverviewCard } from '@/features/admin-workspace/sections/ratings/admin-overview-card'
import { AdminRatingsCard } from '@/features/admin-workspace/sections/ratings/admin-ratings-card'
import { SpaceReviewsCard } from '@/features/admin-workspace/sections/ratings/space-reviews-card'
import { useRatingsSectionState } from '@/features/admin-workspace/sections/ratings/use-ratings-section-state'

export const RatingsSection = () => {
  const {
    isSuperAdmin,
    inspectedAdminId,
    setInspectedAdminId,
    admins,
    selectedFloorId,
    setSelectedFloorId,
    adminRatingsPage,
    setAdminRatingsPage,
    adminRatingsMinFilter,
    setAdminRatingsMinFilter,
    floorReviewsPage,
    setFloorReviewsPage,
    floorReviewsMinFilter,
    setFloorReviewsMinFilter,
    currentUserQuery,
    profileQuery,
    adminRatingsQuery,
    floorReviewsQuery,
    floorOptions,
    adminRatings,
    floorReviews,
    topRatedFloor,
    canGoNextAdminRatings,
    canGoNextFloorReviews,
  } = useRatingsSectionState()

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

      {isSuperAdmin ? (
        <TextField
          select
          fullWidth
          label="Inspect Admin"
          value={inspectedAdminId}
          onChange={(event) => {
            setInspectedAdminId(event.target.value)
            setSelectedFloorId('')
            setAdminRatingsPage(0)
            setAdminRatingsMinFilter(0)
            setFloorReviewsPage(0)
            setFloorReviewsMinFilter(0)
          }}
          helperText="Super Admin view: choose which admin account to inspect."
        >
          {admins
            .filter((item) => item.role === 'ADMIN' || item.id === inspectedAdminId)
            .map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.full_name} ({item.email})
              </MenuItem>
            ))}
        </TextField>
      ) : null}

      <AdminOverviewCard
        adminName={profileQuery.data.admin.full_name}
        averageRating={profileQuery.data.average_rating}
        ratingCount={profileQuery.data.rating_count}
        spacesCount={profileQuery.data.spaces.length}
        topRatedFloor={topRatedFloor}
      />

      <AdminRatingsCard
        ratings={adminRatings}
        minFilter={adminRatingsMinFilter}
        onMinFilterChange={(value) => {
          setAdminRatingsPage(0)
          setAdminRatingsMinFilter(value)
        }}
        page={adminRatingsPage}
        onPreviousPage={() => setAdminRatingsPage((prev) => Math.max(0, prev - 1))}
        onNextPage={() => setAdminRatingsPage((prev) => prev + 1)}
        canGoNext={canGoNextAdminRatings}
        totalCount={adminRatingsQuery.data?.rating_count ?? 0}
      />

      <SpaceReviewsCard
        spaces={floorOptions}
        selectedFloorId={selectedFloorId}
        onSelectFloor={(value) => {
          setSelectedFloorId(value)
          setFloorReviewsPage(0)
          setFloorReviewsMinFilter(0)
        }}
        reviews={floorReviews}
        averageRating={floorReviewsQuery.data?.average_rating}
        ratingCount={floorReviewsQuery.data?.rating_count}
        minFilter={floorReviewsMinFilter}
        onMinFilterChange={(value) => {
          setFloorReviewsPage(0)
          setFloorReviewsMinFilter(value)
        }}
        page={floorReviewsPage}
        onPreviousPage={() => setFloorReviewsPage((prev) => Math.max(0, prev - 1))}
        onNextPage={() => setFloorReviewsPage((prev) => prev + 1)}
        canGoNext={canGoNextFloorReviews}
      />
    </Stack>
  )
}
