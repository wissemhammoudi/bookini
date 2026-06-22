import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api-types'

const updateBookingSchema = z.object({
  new_status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
  admin_notes: z.string().optional(),
})

type UpdateBookingValues = z.infer<typeof updateBookingSchema>

interface PublicBooking {
  id: string
  booking_reference: string
  room_name: string
  guest_name: string
  guest_email: string
  booking_date: string
  start_time: string
  end_time: string
  price: number
  status: string
  participants: number
  created_at: string
}

interface BookingDetails extends PublicBooking {
  notes: string | null
  admin_notes: string | null
}

const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'CONFIRMED':
      return 'success'
    case 'CANCELLED':
      return 'error'
    case 'COMPLETED':
      return 'primary'
    default:
      return 'default'
  }
}

export const PublicBookingsPage = () => {
  const queryClient = useQueryClient()
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)

  const bookingsQuery = useQuery({
    queryKey: ['public-bookings', filterStatus],
    queryFn: async () => {
      const params = filterStatus ? { status: filterStatus } : {}
      const response = await apiClient.get<ApiResponse<PublicBooking[]>>(
        '/admin/super-admin/bookings',
        { params }
      )
      return response.data.data || []
    },
  })

  const bookingDetailsQuery = useQuery({
    queryKey: ['booking-details', selectedBookingId],
    queryFn: async () => {
      if (!selectedBookingId) return null
      const response = await apiClient.get<ApiResponse<BookingDetails>>(
        `/admin/super-admin/bookings/${selectedBookingId}`
      )
      return response.data.data || null
    },
    enabled: !!selectedBookingId,
  })

  const updateMutation = useMutation({
    mutationFn: async (values: UpdateBookingValues) => {
      const response = await apiClient.patch(
        `/admin/super-admin/bookings/${selectedBookingId}/status`,
        null,
        {
          params: {
            new_status: values.new_status,
            admin_notes: values.admin_notes || undefined,
          },
        }
      )
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['public-bookings'] })
      await queryClient.invalidateQueries({ queryKey: ['booking-details'] })
      setUpdateDialogOpen(false)
      setSelectedBookingId(null)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateBookingValues>({
    resolver: zodResolver(updateBookingSchema),
    defaultValues: {
      new_status: 'CONFIRMED',
      admin_notes: '',
    },
  })

  const handleOpenUpdate = () => {
    reset()
    setUpdateDialogOpen(true)
  }

  const onSubmit = async (values: UpdateBookingValues) => {
    await updateMutation.mutateAsync(values)
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Public Bookings Management</Typography>

      {/* Filter */}
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Bookings Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Reference</TableCell>
              <TableCell>Guest Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookingsQuery.data?.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {booking.booking_reference}
                  </Typography>
                </TableCell>
                <TableCell>{booking.guest_name}</TableCell>
                <TableCell>{booking.guest_email}</TableCell>
                <TableCell>{booking.room_name}</TableCell>
                <TableCell>{booking.booking_date}</TableCell>
                <TableCell>€{booking.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={booking.status} color={getStatusColor(booking.status)} size="small" />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedBookingId(booking.id)
                      handleOpenUpdate()
                    }}
                  >
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details and Update Dialog */}
      {selectedBookingId && bookingDetailsQuery.data && (
        <Dialog
          open={updateDialogOpen}
          onClose={() => {
            setUpdateDialogOpen(false)
            setSelectedBookingId(null)
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Manage Booking: {bookingDetailsQuery.data.booking_reference}</DialogTitle>

          <DialogContent sx={{ py: 3 }}>
            <Stack spacing={3}>
              {/* Details */}
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Booking Details
                </Typography>
                <Typography variant="body2">
                  <strong>Guest:</strong> {bookingDetailsQuery.data.guest_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {bookingDetailsQuery.data.guest_email}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {bookingDetailsQuery.data.guest_phone}
                </Typography>
                <Typography variant="body2">
                  <strong>Room:</strong> {bookingDetailsQuery.data.room_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {bookingDetailsQuery.data.booking_date}
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong> {bookingDetailsQuery.data.start_time} - {bookingDetailsQuery.data.end_time}
                </Typography>
                <Typography variant="body2">
                  <strong>Participants:</strong> {bookingDetailsQuery.data.participants}
                </Typography>
                <Typography variant="body2">
                  <strong>Price:</strong> €{bookingDetailsQuery.data.price.toFixed(2)}
                </Typography>
              </Stack>

              <Divider />

              {/* Update Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  {updateMutation.isError && (
                    <Alert severity="error">Failed to update booking.</Alert>
                  )}
                  {updateMutation.isSuccess && (
                    <Alert severity="success">Booking updated successfully.</Alert>
                  )}

                  <TextField
                    select
                    label="New Status"
                    {...register('new_status')}
                    error={Boolean(errors.new_status)}
                    helperText={errors.new_status?.message}
                    size="small"
                  >
                    <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                  </TextField>

                  <TextField
                    label="Admin Notes"
                    multiline
                    minRows={3}
                    {...register('admin_notes')}
                    error={Boolean(errors.admin_notes)}
                    helperText={errors.admin_notes?.message}
                    size="small"
                    placeholder="Add notes about this booking..."
                  />

                  <DialogActions sx={{ p: 0 }}>
                    <Button
                      onClick={() => {
                        setUpdateDialogOpen(false)
                        setSelectedBookingId(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'Updating...' : 'Update Booking'}
                    </Button>
                  </DialogActions>
                </Stack>
              </form>
            </Stack>
          </DialogContent>
        </Dialog>
      )}
    </Stack>
  )
}
