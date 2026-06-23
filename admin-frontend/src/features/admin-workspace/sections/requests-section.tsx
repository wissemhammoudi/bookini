import { useMemo, useState } from 'react'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import {
  Alert,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  Box,
  alpha,
  TextField,
  MenuItem,
  InputAdornment,
} from '@mui/material'
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
}: RequestsSectionProps) => {
  const [contactSearch, setContactSearch] = useState('')
  const [contactStatus, setContactStatus] = useState('ALL')
  const [contactPage, setContactPage] = useState(0)

  const [partnerSearch, setPartnerSearch] = useState('')
  const [partnerStatus, setPartnerStatus] = useState('ALL')
  const [partnerPage, setPartnerPage] = useState(0)

  const PAGE_SIZE = 3

  // Filter contact requests
  const filteredContactRequests = useMemo(() => {
    return contactRequests.filter((request) => {
      const matchesSearch =
        !contactSearch.trim() ||
        [request.full_name, request.email, request.subject, request.message].some((val) =>
          val.toLowerCase().includes(contactSearch.trim().toLowerCase()),
        )

      const matchesStatus = contactStatus === 'ALL' || request.status === contactStatus
      return matchesSearch && matchesStatus
    })
  }, [contactRequests, contactSearch, contactStatus])

  // Paginate contact requests
  const paginatedContactRequests = useMemo(() => {
    const start = contactPage * PAGE_SIZE
    return filteredContactRequests.slice(start, start + PAGE_SIZE)
  }, [filteredContactRequests, contactPage])

  const totalContactPages = Math.ceil(filteredContactRequests.length / PAGE_SIZE)

  // Filter partnership requests
  const filteredPartnerRequests = useMemo(() => {
    return partnerRequests.filter((request) => {
      const matchesSearch =
        !partnerSearch.trim() ||
        [
          request.company_name,
          request.contact_person,
          request.email,
          request.business_description,
        ].some((val) => val.toLowerCase().includes(partnerSearch.trim().toLowerCase()))

      const matchesStatus = partnerStatus === 'ALL' || request.status === partnerStatus
      return matchesSearch && matchesStatus
    })
  }, [partnerRequests, partnerSearch, partnerStatus])

  // Paginate partnership requests
  const paginatedPartnerRequests = useMemo(() => {
    const start = partnerPage * PAGE_SIZE
    return filteredPartnerRequests.slice(start, start + PAGE_SIZE)
  }, [filteredPartnerRequests, partnerPage])

  const totalPartnerPages = Math.ceil(filteredPartnerRequests.length / PAGE_SIZE)

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Contact & Partnership Requests"
        description="Resolve support requests and onboard new organizations from partnership applications."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.98))'
                  : 'linear-gradient(180deg, rgba(16,29,50,0.98), rgba(12,21,37,0.98))',
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Contact Us Requests</Typography>
              <Chip label={`${filteredContactRequests.length} requests`} variant="outlined" />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
              <TextField
                placeholder="Search by name, email, or message..."
                size="small"
                fullWidth
                value={contactSearch}
                onChange={(e) => {
                  setContactSearch(e.target.value)
                  setContactPage(0)
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                select
                label="Status"
                size="small"
                value={contactStatus}
                onChange={(e) => {
                  setContactStatus(e.target.value)
                  setContactPage(0)
                }}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="ALL">All status</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PROCESSED">Processed</MenuItem>
              </TextField>
            </Stack>

            <Stack spacing={2}>
              {paginatedContactRequests.length === 0 ? (
                <EmptyState
                  title="No contact requests"
                  description="Support requests will appear here when submitted."
                />
              ) : (
                paginatedContactRequests.map((request) => (
                  <Paper
                    key={request.id}
                    variant="outlined"
                    sx={{ p: 2.5, borderRadius: 4, backgroundColor: alpha('#0059B3', 0.025) }}
                  >
                    <Stack spacing={1.25}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{request.subject}</Typography>
                          <Typography color="text.secondary">
                            {request.full_name} · {request.email}
                          </Typography>
                        </Box>
                        <StatusChip value={request.status} />
                      </Stack>
                      <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{request.message}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {request.phone} · Received {new Date(request.date).toLocaleString()}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          startIcon={<VisibilityOutlinedIcon />}
                          onClick={() => onPreviewMessage(`${request.full_name}: ${request.message}`)}
                        >
                          View
                        </Button>
                        {request.status === 'PENDING' && (
                          <Button size="small" onClick={() => onMarkProcessed(request)}>
                            Mark Processed
                          </Button>
                        )}
                        <Button size="small" color="error" onClick={() => onDeleteContact(request)}>
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>

            {filteredContactRequests.length > PAGE_SIZE && (
              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', alignItems: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={contactPage === 0}
                  onClick={() => setContactPage((prev) => prev - 1)}
                >
                  Prev
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Page {contactPage + 1} of {totalContactPages}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={contactPage + 1 >= totalContactPages}
                  onClick={() => setContactPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.98))'
                  : 'linear-gradient(180deg, rgba(16,29,50,0.98), rgba(12,21,37,0.98))',
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Become a Partner Requests</Typography>
              <Chip label={`${filteredPartnerRequests.length} requests`} variant="outlined" />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
              <TextField
                placeholder="Search by company, contact, or description..."
                size="small"
                fullWidth
                value={partnerSearch}
                onChange={(e) => {
                  setPartnerSearch(e.target.value)
                  setPartnerPage(0)
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                select
                label="Status"
                size="small"
                value={partnerStatus}
                onChange={(e) => {
                  setPartnerStatus(e.target.value)
                  setPartnerPage(0)
                }}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="ALL">All status</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </TextField>
            </Stack>

            <Stack spacing={2}>
              {paginatedPartnerRequests.length === 0 ? (
                <EmptyState title="No partnership requests" description="New organization requests will appear here." />
              ) : (
                paginatedPartnerRequests.map((request) => (
                  <Paper
                    key={request.id}
                    variant="outlined"
                    sx={{ p: 2.5, borderRadius: 4, backgroundColor: alpha('#00A88F', 0.025) }}
                  >
                    <Stack spacing={1.25}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{request.company_name}</Typography>
                          <Typography color="text.secondary">
                            {request.contact_person} · {request.email}
                          </Typography>
                        </Box>
                        <StatusChip value={request.status} />
                      </Stack>
                      <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{request.business_description}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.phone} · Requested {new Date(request.requested_date).toLocaleDateString()}
                      </Typography>
                      {request.generated_credentials ? (
                        <Alert severity="success">
                          Credentials: {request.generated_credentials.email} / {request.generated_credentials.temporary_password}
                        </Alert>
                      ) : null}
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {request.status === 'PENDING' && (
                          <>
                            <Button size="small" color="success" onClick={() => onApprovePartnership(request)}>
                              Approve
                            </Button>
                            <Button size="small" color="error" onClick={() => onRejectPartnership(request)}>
                              Reject
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>

            {filteredPartnerRequests.length > PAGE_SIZE && (
              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', alignItems: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={partnerPage === 0}
                  onClick={() => setPartnerPage((prev) => prev - 1)}
                >
                  Prev
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Page {partnerPage + 1} of {totalPartnerPages}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={partnerPage + 1 >= totalPartnerPages}
                  onClick={() => setPartnerPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}

