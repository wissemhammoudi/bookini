import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import {
  listCurrentReservations,
  listFloors,
  listReservationHistory,
  cancelReservationRequest,
  getProfileRequest,
  listPublicBookingsByEmail,
} from '@/lib/api'
import { DashboardOverview } from './dashboard/dashboard-overview'

export const DashboardPage = () => {
  const queryClient = useQueryClient()
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const floorsQuery = useQuery({
    queryKey: ['floors-all'],
    queryFn: () => listFloors(),
  })

  const currentQuery = useQuery({
    queryKey: ['reservations-current'],
    queryFn: listCurrentReservations,
  })

  const historyQuery = useQuery({
    queryKey: ['reservations-history'],
    queryFn: listReservationHistory,
  })

  const profileQuery = useQuery({
    queryKey: ['my-profile-dashboard'],
    queryFn: getProfileRequest,
  })

  const publicBookingsQuery = useQuery({
    queryKey: ['public-bookings-by-email', profileQuery.data?.email],
    queryFn: () => listPublicBookingsByEmail(profileQuery.data!.email),
    enabled: Boolean(profileQuery.data?.email),
  })

  const cancelMutation = useMutation({
    mutationFn: cancelReservationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations-current'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-history'] })
      setCancelingId(null)
    },
    onError: (err) => {
      console.error(err)
      setCancelingId(null)
      alert('Failed to cancel reservation. Please try again.')
    },
  })

  const isLoading =
    floorsQuery.isLoading ||
    currentQuery.isLoading ||
    historyQuery.isLoading ||
    profileQuery.isLoading ||
    publicBookingsQuery.isLoading

  const totalFloors = floorsQuery.data?.length ?? 0
  const availableFloors =
    floorsQuery.data?.filter((item) => item.status === 'AVAILABLE').length ?? 0

  const publicBookings = useMemo(
    () => publicBookingsQuery.data ?? [],
    [publicBookingsQuery.data],
  )
  const activePublicBookings = publicBookings.filter(
    (item) => item.status === 'PENDING' || item.status === 'CONFIRMED',
  )
  const pastPublicBookings = publicBookings.filter(
    (item) => item.status !== 'PENDING' && item.status !== 'CONFIRMED',
  )

  const activeReservationsCount =
    (currentQuery.data?.length ?? 0) + activePublicBookings.length
  const historyCount = (historyQuery.data?.length ?? 0) + pastPublicBookings.length

  const totalSpent = useMemo(() => {
    let sum = 0
    publicBookings.forEach((booking) => {
      if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
        sum += booking.price
      }
    })
    return sum
  }, [publicBookings])

  const handleCancelClick = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      setCancelingId(id)
      cancelMutation.mutate(id)
    }
  }

  return (
    <DashboardOverview
      isLoading={isLoading}
      floors={floorsQuery.data}
      currentReservations={currentQuery.data}
      historyReservations={historyQuery.data}
      publicBookings={publicBookings}
      cancelingId={cancelingId}
      totalFloors={totalFloors}
      availableFloors={availableFloors}
      activeReservationsCount={activeReservationsCount}
      historyCount={historyCount}
      totalSpent={totalSpent}
      onCancelReservation={handleCancelClick}
    />
  )
}
