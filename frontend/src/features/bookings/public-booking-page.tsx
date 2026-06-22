import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Container,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  alpha,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'

import { useColorMode } from '@/app/use-color-mode'
import { SUBSCRIPTION_PLANS, AVAILABLE_ROOMS } from './constants'
import { PlanCard } from './components/PlanCard'
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
  const navigate = useNavigate()
  const { mode, toggleMode } = useColorMode()
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
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: alpha(isLight ? '#ffffff' : '#0f1419', isLight ? 0.82 : 0.85),
          backdropFilter: 'blur(18px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <Toolbar>
          <Container
            maxWidth="lg"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              width: '100%',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <IconButton
                onClick={() => navigate('/')}
                color="inherit"
                sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Book a Room
              </Typography>
            </Stack>

            <IconButton
              onClick={toggleMode}
              color="inherit"
              sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
            >
              {isLight ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
            </IconButton>
          </Container>
        </Toolbar>
      </AppBar>

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

          {/* Plans Section */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
              Subscription Plans
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 3,
              }}
            >
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Box key={plan.id}>
                  <PlanCard
                    plan={plan}
                    isSelected={selectedPlan === plan.id}
                    onSelect={setSelectedPlan}
                    isLight={isLight}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)' }} />

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
