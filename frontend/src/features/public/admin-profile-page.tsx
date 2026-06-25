import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Alert, Box, Container } from '@mui/material'
import { useParams } from 'react-router-dom'

import { useColorMode } from '@/app/use-color-mode'
import { PublicFooter } from './components/public-footer'
import { AdminProfileContent } from './components/admin-profile-content'
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

export type FloorFormState = {
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

  const adminRatingsItems = adminRatingsQuery.data?.items ?? []
  const canGoNextAdminRatings = adminRatingsItems.length === adminRatingsLimit
  const floorReviewItems = floorReviewsQuery.data?.reviews ?? []
  const canGoNextFloorReviews = floorReviewItems.length === floorReviewsLimit

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
        <AdminProfileContent
          profile={profile}
          selectedFloorId={selectedFloorId}
          adminRating={adminRating}
          adminComment={adminComment}
          adminRatingsItems={adminRatingsItems}
          adminRatingsPage={adminRatingsPage}
          adminRatingsMinFilter={adminRatingsMinFilter}
          canGoNextAdminRatings={canGoNextAdminRatings}
          floorReviewItems={floorReviewItems}
          floorReviewsPage={floorReviewsPage}
          floorReviewsMinFilter={floorReviewsMinFilter}
          canGoNextFloorReviews={canGoNextFloorReviews}
          floorForms={floorForms}
          onAdminRatingChange={setAdminRating}
          onAdminCommentChange={setAdminComment}
          onAdminRatingsPageChange={setAdminRatingsPage}
          onAdminRatingsMinFilterChange={setAdminRatingsMinFilter}
          onFloorReviewsPageChange={setFloorReviewsPage}
          onFloorReviewsMinFilterChange={setFloorReviewsMinFilter}
          onFloorFormChange={(floorId, next) => setFloorForms((prev) => ({ ...prev, [floorId]: next }))}
          onSaveAdminRating={() =>
            upsertAdminRatingMutation.mutate({
              rating: adminRating,
              comment: adminComment.trim() || undefined,
            })}
          onDeleteAdminRating={() => deleteAdminRatingMutation.mutate()}
          onSaveFloorReview={(floorId) => {
            const floorForm = floorForms[floorId] ?? { rating: 5, comment: '' }
            upsertFloorReviewMutation.mutate({
              floorId,
              payload: {
                rating: floorForm.rating,
                comment: floorForm.comment.trim() || undefined,
              },
            })
          }}
          onDeleteFloorReview={(floorId) => deleteFloorReviewMutation.mutate(floorId)}
          onViewReviews={(floorId) => {
            setFloorReviewsPage(0)
            setFloorReviewsMinFilter(0)
            setSelectedFloorId(floorId)
          }}
          isSavingAdminRating={upsertAdminRatingMutation.isPending}
          isDeletingAdminRating={deleteAdminRatingMutation.isPending}
          isSavingFloorReview={upsertFloorReviewMutation.isPending}
          isDeletingFloorReview={deleteFloorReviewMutation.isPending}
        />
      </Container>

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
