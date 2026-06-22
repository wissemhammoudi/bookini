import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Alert, Button, Chip, Paper, Stack, Typography, Box } from '@mui/material'
import Grid from '@mui/material/Grid'

import type { ContactActionHandler } from '@/features/admin-workspace/admin-workspace-types'
import { EmptyState, SectionHeader, StatusChip } from '@/features/admin-workspace/admin-workspace-utils'
import type { ContactRequestRecord, PartnershipRequestRecord } from '@/lib/api-types'

type RequestsSectionProps = {
  contactRequests: ContactRequestRecord[]
  partnerRequests: PartnershipRequestRecord[]
  onPreviewMessage: (message: string) => void
  onMarkProcessed: ContactActionHandler
  onDeleteContact: ContactActionHandler
  onApprovePartnership: (request: PartnershipRequestRecord) => void
  onRejectPartnership: (request: PartnershipRequestRecord) => void
}

export const RequestsSection = ({
  contactRequests,
  onApprovePartnership,
  onDeleteContact,
  onMarkProcessed,
  onPreviewMessage,
  onRejectPartnership,
  partnerRequests,
}: RequestsSectionProps) => (
  <Stack spacing={3}>
    <SectionHeader title="Contact & Partnership Requests" description="Resolve support requests and onboard new organizations from partnership applications." />
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, xl: 6 }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Contact Us Requests</Typography>
            <Chip label={`${contactRequests.length} requests`} />
          </Stack>
          <Stack spacing={2}>
            {contactRequests.length === 0 ? <EmptyState title="No contact requests" description="Support requests will appear here when submitted." /> : contactRequests.map((request) => (
              <Paper key={request.id} variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography fontWeight={700}>{request.subject}</Typography>
                      <Typography color="text.secondary">{request.full_name} · {request.email}</Typography>
                    </Box>
                    <StatusChip value={request.status} />
                  </Stack>
                  <Typography>{request.message}</Typography>
                  <Typography variant="body2" color="text.secondary">Phone: {request.phone} · {new Date(request.date).toLocaleString()}</Typography>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" startIcon={<VisibilityOutlinedIcon />} onClick={() => onPreviewMessage(`${request.full_name}: ${request.message}`)}>View</Button>
                    <Button size="small" onClick={() => onMarkProcessed(request)}>Mark Processed</Button>
                    <Button size="small" color="error" onClick={() => onDeleteContact(request)}>Delete</Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Become a Partner Requests</Typography>
            <Chip label={`${partnerRequests.length} requests`} />
          </Stack>
          <Stack spacing={2}>
            {partnerRequests.length === 0 ? <EmptyState title="No partnership requests" description="New organization requests will appear here." /> : partnerRequests.map((request) => (
              <Paper key={request.id} variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography fontWeight={700}>{request.company_name}</Typography>
                      <Typography color="text.secondary">{request.contact_person} · {request.email}</Typography>
                    </Box>
                    <StatusChip value={request.status} />
                  </Stack>
                  <Typography>{request.business_description}</Typography>
                  <Typography variant="body2" color="text.secondary">{request.phone} · Requested {new Date(request.requested_date).toLocaleDateString()}</Typography>
                  {request.generated_credentials ? (
                    <Alert severity="success">Credentials: {request.generated_credentials.email} / {request.generated_credentials.temporary_password}</Alert>
                  ) : null}
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" color="success" onClick={() => onApprovePartnership(request)}>Approve</Button>
                    <Button size="small" color="error" onClick={() => onRejectPartnership(request)}>Reject</Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  </Stack>
)
