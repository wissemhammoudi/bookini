import { Button, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'

import type { ReservationActionHandler, ReservationFilter } from '@/features/admin-workspace/admin-workspace-types'
import { EmptyState, SectionHeader, StatusChip } from '@/features/admin-workspace/admin-workspace-utils'
import type { ReservationRecord } from '@/lib/api-types'

type ReservationsSectionProps = {
  reservations: ReservationRecord[]
  search: string
  reservationFilter: ReservationFilter
  onSearchChange: (value: string) => void
  onReservationFilterChange: (value: ReservationFilter) => void
  onApprove: ReservationActionHandler
  onReject: ReservationActionHandler
  onCancel: ReservationActionHandler
}

export const ReservationsSection = ({
  onApprove,
  onCancel,
  onReject,
  onReservationFilterChange,
  onSearchChange,
  reservationFilter,
  reservations,
  search,
}: ReservationsSectionProps) => (
  <Stack spacing={3}>
    <SectionHeader title="Reservation Management" description="Search and filter reservation workflow across all managed places and floors." />
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <TextField fullWidth placeholder="Search by reservation, user, place, or floor" value={search} onChange={(event) => onSearchChange(event.target.value)} />
      <TextField select label="Status" value={reservationFilter} onChange={(event) => onReservationFilterChange(event.target.value as ReservationFilter)} sx={{ minWidth: { md: 220 } }}>
        <MenuItem value="ALL">All statuses</MenuItem>
        <MenuItem value="PENDING">Pending</MenuItem>
        <MenuItem value="APPROVED">Approved</MenuItem>
        <MenuItem value="REJECTED">Rejected</MenuItem>
        <MenuItem value="CANCELLED">Cancelled</MenuItem>
      </TextField>
    </Stack>
    {reservations.length === 0 ? <EmptyState title="No reservations found" description="Try a different status filter or search term." /> : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reservation ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Place</TableCell>
              <TableCell>Floor</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id} hover>
                <TableCell>{reservation.id}</TableCell>
                <TableCell>{reservation.user_name}</TableCell>
                <TableCell>{reservation.place_name}</TableCell>
                <TableCell>{reservation.floor_name}</TableCell>
                <TableCell>{reservation.date}</TableCell>
                <TableCell>{reservation.time}</TableCell>
                <TableCell><StatusChip value={reservation.status} /></TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" onClick={() => onApprove(reservation)}>Approve</Button>
                    <Button size="small" color="warning" onClick={() => onReject(reservation)}>Reject</Button>
                    <Button size="small" color="error" onClick={() => onCancel(reservation)}>Cancel</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </Stack>
)
