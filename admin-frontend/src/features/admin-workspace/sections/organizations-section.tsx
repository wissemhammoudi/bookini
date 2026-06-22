import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Avatar, Box, Button, Chip, Paper, Stack, TextField, Typography, alpha } from '@mui/material'
import Grid from '@mui/material/Grid'

import type { OrganizationActionHandler } from '@/features/admin-workspace/admin-workspace-types'
import { EmptyState, SectionHeader, StatusChip } from '@/features/admin-workspace/admin-workspace-utils'
import type { OrganizationRecord } from '@/lib/api-types'

type OrganizationsSectionProps = {
  organizations: OrganizationRecord[]
  search: string
  onSearchChange: (value: string) => void
  onCreateOrganization: () => void
  onEditOrganization: OrganizationActionHandler
  onToggleOrganizationStatus: OrganizationActionHandler
  onDeleteOrganization: OrganizationActionHandler
}

export const OrganizationsSection = ({
  organizations,
  onCreateOrganization,
  onDeleteOrganization,
  onEditOrganization,
  onSearchChange,
  onToggleOrganizationStatus,
  search,
}: OrganizationsSectionProps) => (
  <Stack spacing={3}>
    <SectionHeader
      title="Organization Management"
      description="Maintain partner organizations, assets, contact details, and activation state."
      action={<Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={onCreateOrganization}>Create Organization</Button>}
    />
    <TextField fullWidth placeholder="Search organizations" value={search} onChange={(event) => onSearchChange(event.target.value)} />
    {organizations.length === 0 ? <EmptyState title="No organizations found" description="Create an organization to start provisioning admin accounts and places." /> : (
      <Grid container spacing={2.5}>
        {organizations.map((organization) => (
          <Grid key={organization.id} size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.98))' }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Avatar src={organization.logo || undefined} sx={{ width: 56, height: 56 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{organization.name}</Typography>
                    <Typography color="text.secondary">{organization.contact_email}</Typography>
                  </Box>
                  <StatusChip value={organization.status} />
                </Stack>
                <Typography color="text.secondary">{organization.description}</Typography>
                <Typography variant="body2">{organization.address}</Typography>
                <Typography variant="body2">{organization.contact_phone}</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {organization.social_links.map((link) => (
                    <Chip key={link} label={new URL(link).hostname} variant="outlined" sx={{ backgroundColor: alpha('#0F6FDB', 0.04) }} />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button startIcon={<EditOutlinedIcon />} onClick={() => onEditOrganization(organization)}>Edit</Button>
                  <Button startIcon={organization.status === 'ACTIVE' ? <BlockOutlinedIcon /> : <CheckCircleOutlineOutlinedIcon />} onClick={() => onToggleOrganizationStatus(organization)}>
                    {organization.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </Button>
                  <Button color="error" startIcon={<DeleteOutlineOutlinedIcon />} onClick={() => onDeleteOrganization(organization)}>Delete</Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    )}
  </Stack>
)
