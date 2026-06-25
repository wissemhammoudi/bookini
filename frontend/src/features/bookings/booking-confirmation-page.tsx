import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Container,
  Stack,
} from '@mui/material'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import { PublicFooter } from '@/features/public/components/public-footer'
import { getPublicBookingByReference } from '@/lib/api'
import {
  BookingConfirmationHero,
  BookingDetailsGrid,
  BookingReferenceSearch,
  BookingSupportAlert,
} from './components/booking-confirmation-sections'

/**
 * Booking Confirmation Page
 * Displays booking details and allows searching for existing bookings
 *
 * Features:
 * - Display full booking confirmation with reference
 * - Search for bookings by reference
 * - Download booking as iCalendar file
 * - Support contact information
 */
export const BookingConfirmationPage = () => {
  const { reference = '' } = useParams()
  const navigate = useNavigate()
  const { mode } = useColorMode()
  const isLight = mode === 'light'
  const [searchReference, setSearchReference] = useState(reference)

  const bookingQuery = useQuery({
    queryKey: ['public-booking', reference],
    queryFn: () => getPublicBookingByReference(reference),
    enabled: Boolean(reference),
    retry: false,
  })

  const booking = bookingQuery.data
  const metadata = booking?.metadata_payload ?? {}
  const endDate = typeof metadata.end_date === 'string' ? metadata.end_date : undefined
  const numberOfDays =
    typeof metadata.number_of_days === 'number'
      ? metadata.number_of_days
      : Number(metadata.number_of_days) || undefined

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchReference) {
      navigate(`/booking-confirmation/${searchReference}`)
    }
  }

  const downloadICalendar = () => {
    if (!booking) return

    const endDateRaw = endDate || booking.booking_date
    const dtstart = `${booking.booking_date.replace(/-/g, '')}T${booking.start_time.replace(/:/g, '')}00`
    const dtend = `${endDateRaw.replace(/-/g, '')}T${booking.end_time.replace(/:/g, '')}00`

    const event = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//bookiwa7dek//EN
BEGIN:VEVENT
UID:${booking.booking_reference}@bookiwa7dek.com
DTSTAMP:20240622T143000Z
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${booking.room_name} - bookiwa7dek Booking
DESCRIPTION:Booking Reference: ${booking.booking_reference}\\nGuest: ${booking.guest_name}\\nParticipants: ${booking.participants}
LOCATION:${booking.room_name}
END:VEVENT
END:VCALENDAR`

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(event))
    element.setAttribute('download', `${booking.booking_reference}.ics`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

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

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={4}>
          {bookingQuery.isLoading ? (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              Loading booking details...
            </Alert>
          ) : null}

          {bookingQuery.isError ? (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              Booking not found. Please check your reference and try again.
            </Alert>
          ) : null}

          <BookingConfirmationHero
            booking={booking}
            endDate={endDate}
            numberOfDays={numberOfDays}
            isLight={isLight}
          />

          <BookingReferenceSearch
            isLight={isLight}
            searchReference={searchReference}
            onSearchReferenceChange={setSearchReference}
            onSubmit={handleSearch}
          />

          {booking ? (
            <BookingDetailsGrid
              booking={booking}
              endDate={endDate}
              numberOfDays={numberOfDays}
              isLight={isLight}
              onDownloadICalendar={downloadICalendar}
            />
          ) : null}

          <BookingSupportAlert />
        </Stack>
      </Container>

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
