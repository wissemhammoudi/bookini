import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api-types'

const updatePartnershipSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  admin_notes: z.string().optional(),
})

type UpdatePartnershipValues = z.infer<typeof updatePartnershipSchema>

interface PartnershipRequest {
  id: string
  company_name: string
  contact_person: string
  contact_email: string
  contact_phone: string
  number_of_floors: number
  expected_users: number
  status: string
  created_at: string
}

interface PartnershipDetails extends PartnershipRequest {
  description: string
  admin_notes: string | null
  updated_at: string
}

const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'APPROVED':
      return 'success'
    case 'REJECTED':
      return 'error'
    default:
      return 'default'
  }
}

export const PartnershipRequestsPage = () => {
  const queryClient = useQueryClient()
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)

  const requestsQuery = useQuery({
    queryKey: ['partnership-requests', filterStatus],
    queryFn: async () => {
      const params = filterStatus ? { status: filterStatus } : {}
      const response = await apiClient.get<ApiResponse<PartnershipRequest[]>>(
        '/admin/super-admin/partnerships',
        { params }
      )
      return response.data.data || []
    },
  })

  const requestDetailsQuery = useQuery({
    queryKey: ['partnership-details', selectedRequestId],
    queryFn: async () => {
      if (!selectedRequestId) return null
      const response = await apiClient.get<ApiResponse<PartnershipDetails>>(
        `/admin/super-admin/partnerships/${selectedRequestId}`
      )
      return response.data.data || null
    },
    enabled: !!selectedRequestId,
  })

  const updateMutation = useMutation({
    mutationFn: async (values: UpdatePartnershipValues) => {
      const response = await apiClient.patch(
        `/admin/super-admin/partnerships/${selectedRequestId}`,
        {
          status: values.status,
          admin_notes: values.admin_notes || null,
        }
      )
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['partnership-requests'] })
      await queryClient.invalidateQueries({ queryKey: ['partnership-details'] })
      setUpdateDialogOpen(false)
      setSelectedRequestId(null)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdatePartnershipValues>({
    resolver: zodResolver(updatePartnershipSchema),
    defaultValues: {
      status: 'APPROVED',
      admin_notes: '',
    },
  })

  const handleOpenUpdate = () => {
    reset()
    setUpdateDialogOpen(true)
  }

  const onSubmit = async (values: UpdatePartnershipValues) => {
    await updateMutation.mutateAsync(values)
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Partnership Requests Management</Typography>

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
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Requests Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Company</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Floors</TableCell>
              <TableCell>Expected Users</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requestsQuery.data?.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {request.company_name}
                  </Typography>
                </TableCell>
                <TableCell>{request.contact_person}</TableCell>
                <TableCell>{request.contact_email}</TableCell>
                <TableCell>{request.contact_phone}</TableCell>
                <TableCell>{request.number_of_floors}</TableCell>
                <TableCell>{request.expected_users}</TableCell>
                <TableCell>
                  <Chip label={request.status} color={getStatusColor(request.status)} size="small" />
                </TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedRequestId(request.id)
                      handleOpenUpdate()
                    }}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details and Update Dialog */}
      {selectedRequestId && requestDetailsQuery.data && (
        <Dialog
          open={updateDialogOpen}
          onClose={() => {
            setUpdateDialogOpen(false)
            setSelectedRequestId(null)
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Review Partnership: {requestDetailsQuery.data.company_name}</DialogTitle>

          <DialogContent sx={{ py: 3 }}>
            <Stack spacing={3}>
              {/* Details */}
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Company Information
                </Typography>
                <Typography variant="body2">
                  <strong>Company:</strong> {requestDetailsQuery.data.company_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Contact Person:</strong> {requestDetailsQuery.data.contact_person}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {requestDetailsQuery.data.contact_email}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {requestDetailsQuery.data.contact_phone}
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Business Details
                </Typography>
                <Typography variant="body2">
                  <strong>Number of Floors:</strong> {requestDetailsQuery.data.number_of_floors}
                </Typography>
                <Typography variant="body2">
                  <strong>Expected Users:</strong> {requestDetailsQuery.data.expected_users}
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {requestDetailsQuery.data.description}
                </Typography>
              </Stack>

              <Divider />

              {/* Update Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  {updateMutation.isError && (
                    <Alert severity="error">Failed to update partnership request.</Alert>
                  )}
                  {updateMutation.isSuccess && (
                    <Alert severity="success">Partnership request updated successfully.</Alert>
                  )}

                  <TextField
                    select
                    label="Status"
                    {...register('status')}
                    error={Boolean(errors.status)}
                    helperText={errors.status?.message}
                    size="small"
                  >
                    <MenuItem value="APPROVED">Approve</MenuItem>
                    <MenuItem value="REJECTED">Reject</MenuItem>
                  </TextField>

                  <TextField
                    label="Admin Notes"
                    multiline
                    minRows={3}
                    {...register('admin_notes')}
                    error={Boolean(errors.admin_notes)}
                    helperText={errors.admin_notes?.message}
                    size="small"
                    placeholder="Add notes about this partnership request..."
                  />

                  <DialogActions sx={{ p: 0 }}>
                    <Button
                      onClick={() => {
                        setUpdateDialogOpen(false)
                        setSelectedRequestId(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'Updating...' : 'Update Status'}
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
