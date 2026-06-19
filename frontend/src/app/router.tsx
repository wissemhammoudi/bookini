import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from './app-layout'
import { ProtectedRoute } from '../features/auth/protected-route'
import { DashboardPage } from '../pages/dashboard-page'
import { LoginPage } from '../pages/login-page'
import { NotFoundPage } from '../pages/not-found-page'
import { LandingPage } from '../pages/landing-page'
import { ReservationsPage } from '../pages/reservations-page'
import { RegisterPage } from '../pages/register-page'
import { AvailableRoomsPage } from '../pages/available-rooms-page'
import { CreateReservationPage } from '../pages/create-reservation-page'
import { ActivitiesPage } from '../pages/activities-page'
import { ProfilePage } from '../pages/profile-page'
import { AdminDashboardPage } from '../pages/admin-dashboard-page'
import { FloorManagementPage } from '../pages/floor-management-page'
import { ReservationManagementPage } from '../pages/reservation-management-page'
import { OccupancyMonitoringPage } from '../pages/occupancy-monitoring-page'
import { StatisticsPage } from '../pages/statistics-page'
import { SuperAdminDashboardPage } from '../pages/super-admin-dashboard-page'
import { AuditLogsPage } from '../pages/audit-logs-page'
import { AdminManagementPage } from '../pages/admin-management-page'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/rooms" element={<AvailableRoomsPage />} />
            <Route path="/reservations/new" element={<CreateReservationPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/floors" element={<FloorManagementPage />} />
            <Route
              path="/admin/reservations"
              element={<ReservationManagementPage />}
            />
            <Route
              path="/admin/occupancy"
              element={<OccupancyMonitoringPage />}
            />
            <Route path="/admin/statistics" element={<StatisticsPage />} />
            <Route
              path="/super-admin/dashboard"
              element={<SuperAdminDashboardPage />}
            />
            <Route path="/super-admin/audit-logs" element={<AuditLogsPage />} />
            <Route
              path="/super-admin/admins"
              element={<AdminManagementPage />}
            />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
