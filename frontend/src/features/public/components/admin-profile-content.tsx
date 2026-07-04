import { Grid, Stack } from '@mui/material'

import type { AdminProfile, AdminRating, FloorReview } from '@/lib/api'
import type { FloorFormState } from '@/features/public/admin-profile-page'
import {
  OwnerProfileCard,
  OwnerRatingEditorCard,
  OwnerRatingsListCard,
} from './admin-profile-content-sections'
import { OwnerSpacesSection } from './admin-profile-owner-spaces-section'

type AdminProfileContentProps = {
  profile: AdminProfile
  selectedFloorId: string | null
  adminRating: number
  adminComment: string
  adminRatingsItems: AdminRating[]
  adminRatingsPage: number
  adminRatingsMinFilter: number
  canGoNextAdminRatings: boolean
  floorReviewItems: FloorReview[]
  floorReviewsPage: number
  floorReviewsMinFilter: number
  canGoNextFloorReviews: boolean
  floorForms: Record<string, FloorFormState>
  onAdminRatingChange: (value: number) => void
  onAdminCommentChange: (value: string) => void
  onAdminRatingsPageChange: (next: number) => void
  onAdminRatingsMinFilterChange: (value: number) => void
  onFloorReviewsPageChange: (next: number) => void
  onFloorReviewsMinFilterChange: (value: number) => void
  onFloorFormChange: (floorId: string, next: FloorFormState) => void
  onSaveAdminRating: () => void
  onDeleteAdminRating: () => void
  onSaveFloorReview: (floorId: string) => void
  onDeleteFloorReview: (floorId: string) => void
  onViewReviews: (floorId: string) => void
  isSavingAdminRating: boolean
  isDeletingAdminRating: boolean
  isSavingFloorReview: boolean
  isDeletingFloorReview: boolean
}

export const AdminProfileContent = ({
  profile,
  selectedFloorId,
  adminRating,
  adminComment,
  adminRatingsItems,
  adminRatingsPage,
  adminRatingsMinFilter,
  canGoNextAdminRatings,
  floorReviewItems,
  floorReviewsPage,
  floorReviewsMinFilter,
  canGoNextFloorReviews,
  floorForms,
  onAdminRatingChange,
  onAdminCommentChange,
  onAdminRatingsPageChange,
  onAdminRatingsMinFilterChange,
  onFloorReviewsPageChange,
  onFloorReviewsMinFilterChange,
  onFloorFormChange,
  onSaveAdminRating,
  onDeleteAdminRating,
  onSaveFloorReview,
  onDeleteFloorReview,
  onViewReviews,
  isSavingAdminRating,
  isDeletingAdminRating,
  isSavingFloorReview,
  isDeletingFloorReview,
}: AdminProfileContentProps) => {
  return (
    <Stack spacing={3.5}>
      <OwnerProfileCard profile={profile} />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <OwnerRatingEditorCard
            adminRating={adminRating}
            adminComment={adminComment}
            onAdminRatingChange={onAdminRatingChange}
            onAdminCommentChange={onAdminCommentChange}
            onSaveAdminRating={onSaveAdminRating}
            onDeleteAdminRating={onDeleteAdminRating}
            isSavingAdminRating={isSavingAdminRating}
            isDeletingAdminRating={isDeletingAdminRating}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <OwnerRatingsListCard
            adminRatingsItems={adminRatingsItems}
            adminRatingsPage={adminRatingsPage}
            adminRatingsMinFilter={adminRatingsMinFilter}
            canGoNextAdminRatings={canGoNextAdminRatings}
            onAdminRatingsPageChange={onAdminRatingsPageChange}
            onAdminRatingsMinFilterChange={onAdminRatingsMinFilterChange}
          />
        </Grid>
      </Grid>

      <OwnerSpacesSection
        profile={profile}
        selectedFloorId={selectedFloorId}
        floorForms={floorForms}
        floorReviewItems={floorReviewItems}
        floorReviewsPage={floorReviewsPage}
        floorReviewsMinFilter={floorReviewsMinFilter}
        canGoNextFloorReviews={canGoNextFloorReviews}
        onFloorReviewsPageChange={onFloorReviewsPageChange}
        onFloorReviewsMinFilterChange={onFloorReviewsMinFilterChange}
        onFloorFormChange={onFloorFormChange}
        onSaveFloorReview={onSaveFloorReview}
        onDeleteFloorReview={onDeleteFloorReview}
        onViewReviews={onViewReviews}
        isSavingFloorReview={isSavingFloorReview}
        isDeletingFloorReview={isDeletingFloorReview}
      />
    </Stack>
  )
}
