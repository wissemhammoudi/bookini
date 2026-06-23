import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import {
  Avatar,
  Button,
  InputAdornment,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Box,
} from '@mui/material'

import type { RoleFilter, UserActionHandler } from '@/features/admin-workspace/admin-workspace-types'
import { EmptyState, SectionHeader, StatusChip } from '@/features/admin-workspace/admin-workspace-utils'
import type { UserRecord, OrganizationRecord } from '@/lib/api-types'

type UsersSectionProps = {
  users: UserRecord[]
  organizations: OrganizationRecord[]
  search: string
  roleFilter: RoleFilter
  onSearchChange: (value: string) => void
  onRoleFilterChange: (value: RoleFilter) => void
  onCreateUser: () => void
  onEditUser: UserActionHandler
  onToggleUserStatus: UserActionHandler
  onDeleteUser: UserActionHandler
}

export const UsersSection = ({
  onCreateUser,
  onDeleteUser,
  onEditUser,
  onRoleFilterChange,
  onSearchChange,
  onToggleUserStatus,
  roleFilter,
  search,
  users,
  organizations,
}: UsersSectionProps) => (
  <Stack spacing={3}>
    <SectionHeader
      title="User Management"
      description="Manage platform administrators and end users with search, role filters, and lifecycle actions."
      action={<Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={onCreateUser}>Create User</Button>}
    />
    <Paper sx={{ p: 2.25, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={1.75}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Directory Filters</Typography>
          <Chip size="small" label={`${users.length} user${users.length === 1 ? '' : 's'}`} variant="outlined" />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search by name, email, or phone"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField select label="Role" value={roleFilter} onChange={(event) => onRoleFilterChange(event.target.value as RoleFilter)} sx={{ minWidth: { md: 220 } }}>
            <MenuItem value="ALL">All roles</MenuItem>
            <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
            <MenuItem value="ADMIN">Organization Admin</MenuItem>
            <MenuItem value="USER">Regular User</MenuItem>
          </TextField>
        </Stack>
      </Stack>
    </Paper>
    {users.length === 0 ? <EmptyState title="No users found" description="Adjust the search or create a new user to populate this workspace." /> : (
      <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Profile</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Organizations</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell><Avatar src={user.profile_image || undefined} alt={user.full_name} /></TableCell>
                <TableCell>
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>{user.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.id}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.role.replace('_', ' ')}</TableCell>
                <TableCell>
                  {user.organization_ids && user.organization_ids.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {user.organization_ids.map((orgId) => {
                        const org = organizations.find((o) => o.id === orgId)
                        return <Chip key={orgId} label={org?.name ?? orgId} size="small" variant="outlined" />
                      })}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">—</Typography>
                  )}
                </TableCell>
                <TableCell><StatusChip value={user.status} /></TableCell>
                <TableCell>{new Date(user.created_date).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'inline-flex', p: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Stack direction="row" spacing={0.25} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <IconButton size="small" onClick={() => onEditUser(user)}><EditOutlinedIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => onToggleUserStatus(user)}>
                        {user.status === 'ACTIVE' ? <BlockOutlinedIcon fontSize="small" /> : <CheckCircleOutlineOutlinedIcon fontSize="small" />}
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => onDeleteUser(user)}><DeleteOutlineOutlinedIcon fontSize="small" /></IconButton>
                    </Stack>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </Stack>
)
