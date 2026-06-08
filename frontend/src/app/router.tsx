import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from './app-layout'
import { ProtectedRoute } from '../features/auth/protected-route'
import { DashboardPage } from '../pages/dashboard-page'
import { LoginPage } from '../pages/login-page'
import { NotFoundPage } from '../pages/not-found-page'
import { ReservationsPage } from '../pages/reservations-page'
import { RegisterPage } from '../pages/register-page'
import { AvailableRoomsPage } from '../pages/available-rooms-page'
import { CreateReservationPage } from '../pages/create-reservation-page'
import { ActivitiesPage } from '../pages/activities-page'
import { ProfilePage } from '../pages/profile-page'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/rooms" element={<AvailableRoomsPage />} />
            <Route path="/reservations/new" element={<CreateReservationPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
