import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import {
  Avatar,
  Button,
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
} from '@mui/material'

import type { RoleFilter, UserActionHandler } from '@/features/admin-workspace/admin-workspace-types'
import { EmptyState, SectionHeader, StatusChip } from '@/features/admin-workspace/admin-workspace-utils'
import type { UserRecord } from '@/lib/api-types'

type UsersSectionProps = {
  users: UserRecord[]
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
}: UsersSectionProps) => (
  <Stack spacing={3}>
    <SectionHeader
      title="User Management"
      description="Manage platform administrators and end users with search, role filters, and lifecycle actions."
      action={<Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={onCreateUser}>Create User</Button>}
    />
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <TextField
        fullWidth
        placeholder="Search by name, email, or phone"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        slotProps={{ input: { startAdornment: <SearchOutlinedIcon color="action" sx={{ mr: 1 }} /> } }}
      />
      <TextField select label="Role" value={roleFilter} onChange={(event) => onRoleFilterChange(event.target.value as RoleFilter)} sx={{ minWidth: { md: 220 } }}>
        <MenuItem value="ALL">All roles</MenuItem>
        <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
        <MenuItem value="ADMIN">Organization Admin</MenuItem>
        <MenuItem value="USER">Regular User</MenuItem>
      </TextField>
    </Stack>
    {users.length === 0 ? <EmptyState title="No users found" description="Adjust the search or create a new user to populate this workspace." /> : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Profile</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell><Avatar src={user.profile_image} alt={user.full_name} /></TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.role.replace('_', ' ')}</TableCell>
                <TableCell><StatusChip value={user.status} /></TableCell>
                <TableCell>{new Date(user.created_date).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton onClick={() => onEditUser(user)}><EditOutlinedIcon /></IconButton>
                    <IconButton onClick={() => onToggleUserStatus(user)}>
                      {user.status === 'ACTIVE' ? <BlockOutlinedIcon /> : <CheckCircleOutlineOutlinedIcon />}
                    </IconButton>
                    <IconButton color="error" onClick={() => onDeleteUser(user)}><DeleteOutlineOutlinedIcon /></IconButton>
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
