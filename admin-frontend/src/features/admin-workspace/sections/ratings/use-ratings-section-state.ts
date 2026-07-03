import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  getAdminPublicProfile,
  getCurrentUserProfile,
  listAdmins,
  listAdminRatingsByAdmin,
  listFloorReviewsByFloor,
} from '@/lib/api'

export function useRatingsSectionState() {
  const [inspectedAdminId, setInspectedAdminId] = useState<string>('')
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

  const isSuperAdmin = currentUserQuery.data?.role === 'SUPER_ADMIN'
  const currentAdminId = currentUserQuery.data?.id ?? ''

  const adminsQuery = useQuery({
    queryKey: ['workspace-admins-list'],
    queryFn: listAdmins,
    enabled: isSuperAdmin,
  })

  const defaultSuperAdminTarget = useMemo(() => {
    if (!isSuperAdmin) return ''
    const admins = adminsQuery.data ?? []
    const firstOrgAdmin = admins.find((item) => item.role === 'ADMIN')
    if (firstOrgAdmin) return firstOrgAdmin.id
    const firstOtherAdmin = admins.find((item) => item.id !== currentAdminId)
    return firstOtherAdmin?.id ?? currentAdminId
  }, [isSuperAdmin, adminsQuery.data, currentAdminId])

  const adminId = isSuperAdmin
    ? (inspectedAdminId || defaultSuperAdminTarget)
    : currentAdminId

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
    isSuperAdmin,
    inspectedAdminId: isSuperAdmin ? (inspectedAdminId || defaultSuperAdminTarget) : adminId,
    setInspectedAdminId,
    admins: adminsQuery.data ?? [],
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
