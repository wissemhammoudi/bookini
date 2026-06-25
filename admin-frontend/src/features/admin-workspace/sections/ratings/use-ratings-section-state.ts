import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  getAdminPublicProfile,
  getCurrentUserProfile,
  listAdminRatingsByAdmin,
  listFloorReviewsByFloor,
} from '@/lib/api'

export function useRatingsSectionState() {
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
    queryKey: ['workspace-admin-ratings', adminId, adminRatingsPage, adminRatingsMinFilter],
    queryFn: () =>
      listAdminRatingsByAdmin(adminId, {
        limit: adminRatingsLimit,
        offset: adminRatingsPage * adminRatingsLimit,
        min_rating: adminRatingsMinFilter > 0 ? adminRatingsMinFilter : undefined,
      }),
    enabled: Boolean(adminId),
  })

  const floorReviewsQuery = useQuery({
    queryKey: ['workspace-floor-reviews', selectedFloorId, floorReviewsPage, floorReviewsMinFilter],
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
  const floorReviews = floorReviewsQuery.data?.reviews ?? []

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

  return {
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
    canGoNextAdminRatings: adminRatings.length === adminRatingsLimit,
    canGoNextFloorReviews: floorReviews.length === floorReviewsLimit,
  }
}
