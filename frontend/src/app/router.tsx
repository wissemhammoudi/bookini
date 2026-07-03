
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/app/app-layout'
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ProfilePage,
  ProtectedRoute,
} from '@/features/auth'
import { DashboardPage } from '@/pages/dashboard-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { LandingPage, AboutPage, ContactPage, ReservationsInfoPage, AdminProfilePage } from '@/features/public'
import { PublicBookingPage, PlaceDetailsPage, FloorDetailsPage, BookingRequestPage, BookingConfirmationPage } from '@/features/bookings'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/reservations-info" element={<ReservationsInfoPage />} />
        <Route path="/admins/:adminId" element={<AdminProfilePage />} />
        <Route path="/book" element={<PublicBookingPage />} />
        <Route path="/book/place/:roomId" element={<PlaceDetailsPage />} />
        <Route path="/book/place/:roomId/floor/:floorId" element={<FloorDetailsPage />} />
        <Route path="/book/place/:roomId/floor/:floorId/reserve" element={<BookingRequestPage />} />
        <Route path="/booking-confirmation/:reference" element={<BookingConfirmationPage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
