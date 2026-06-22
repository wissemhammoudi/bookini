import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/app/app-layout'
import { ProtectedRoute } from '@/features/auth/protected-route'
import { LoginPage } from '@/features/auth/login-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { AdminDashboardPage } from '@/features/admin/admin-dashboard-page'
import { FloorManagementPage } from '@/features/floors/floor-management-page'
import { ReservationManagementPage } from '@/features/reservations/reservation-management-page'
import { OccupancyMonitoringPage } from '@/features/admin/occupancy-monitoring-page'
import { StatisticsPage } from '@/features/admin/statistics-page'
import { SuperAdminDashboardPage } from '@/features/admin/super-admin-dashboard-page'
import { AuditLogsPage } from '@/features/admin/audit-logs-page'
import { AdminManagementPage } from '@/features/admin/admin-management-page'
import { PublicBookingsPage } from '@/features/admin/public-bookings-page'
import { PartnershipRequestsPage } from '@/features/admin/partnership-requests-page'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
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
            <Route
              path="/super-admin/bookings"
              element={<PublicBookingsPage />}
            />
            <Route
              path="/super-admin/partnerships"
              element={<PartnershipRequestsPage />}
            />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
