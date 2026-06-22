import { useState } from 'react'
import {
  Box,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import { AVAILABLE_ROOMS } from './constants'
import { RoomCard } from './components/RoomCard'
import { BookingDialog } from './components/BookingDialog'
import type { BookingFormData } from './types'
import type { Room } from './constants'

/**
 * Public Booking Page
 * Allows users to browse subscription plans and book rooms
 * 
 * Features:
 * - Select subscription plan (Pay-As-You-Go, Starter, Professional)
 * - Browse available rooms with amenities and pricing
 * - Book rooms with date, time, and guest information
 * - Real-time price calculation based on plan and duration
 */
export const PublicBookingPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  const [selectedPlan, setSelectedPlan] = useState('pay-as-you-go')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room)
    setBookingDialogOpen(true)
  }

  const handleBookingSubmit = (data: BookingFormData & { roomId: number; roomName: string; planId: string; price: number }) => {
    // In production, send to API via bookingService
    console.log('Booking submitted:', data)
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
        <Stack spacing={8}>
          {/* Header */}
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
              Book Your Perfect Space
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2, maxWidth: 600 }}>
              Choose a subscription plan that works for you, then select from our available rooms and spaces.
            </Typography>
          </Box>

          {/* Rooms Section */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
              Available Rooms
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 3,
              }}
            >
              {AVAILABLE_ROOMS.map((room) => (
                <Box key={room.id}>
                  <RoomCard
                    room={room}
                    isLight={isLight}
                    onBookNow={handleRoomSelect}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>
      </Container>

      {/* Booking Dialog */}
      <BookingDialog
        open={bookingDialogOpen}
        room={selectedRoom}
        selectedPlan={selectedPlan}
        isLight={isLight}
        onClose={() => {
          setBookingDialogOpen(false)
          setSelectedRoom(null)
        }}
        onSubmit={handleBookingSubmit}
      />
    </Box>
  )
}
