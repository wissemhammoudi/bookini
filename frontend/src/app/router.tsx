import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/app/app-layout'
import { ProtectedRoute } from '@/features/auth/protected-route'
import { DashboardPage } from '@/pages/dashboard-page'
import { LoginPage } from '@/features/auth/login-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { LandingPage } from '@/pages/landing-page'
import { ReservationsPage } from '@/features/reservations/reservations-page'
import { RegisterPage } from '@/features/auth/register-page'
import { AvailableRoomsPage } from '@/features/floors/available-rooms-page'
import { CreateReservationPage } from '@/features/reservations/create-reservation-page'
import { ActivitiesPage } from '@/features/activities/activities-page'
import { ProfilePage } from '@/features/auth/profile-page'
import { AdminDashboardPage } from '@/features/admin/admin-dashboard-page'
import { FloorManagementPage } from '@/features/floors/floor-management-page'
import { ReservationManagementPage } from '@/features/reservations/reservation-management-page'
import { OccupancyMonitoringPage } from '@/features/admin/occupancy-monitoring-page'
import { StatisticsPage } from '@/features/admin/statistics-page'
import { SuperAdminDashboardPage } from '@/features/admin/super-admin-dashboard-page'
import { AuditLogsPage } from '@/features/admin/audit-logs-page'
import { AdminManagementPage } from '@/features/admin/admin-management-page'

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
