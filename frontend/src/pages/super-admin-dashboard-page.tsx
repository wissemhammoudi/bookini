import { useQuery } from '@tanstack/react-query'
import { Alert, Grid, Paper, Stack, Typography } from '@mui/material'

import { getSuperAdminSettings, listAdmins } from '../lib/api'

export const SuperAdminDashboardPage = () => {
  const settingsQuery = useQuery({
    queryKey: ['super-admin-settings'],
    queryFn: getSuperAdminSettings,
  })
  const adminsQuery = useQuery({
    queryKey: ['admins-list'],
    queryFn: listAdmins,
  })

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Super admin dashboard</Typography>

      {settingsQuery.isError ? (
        <Alert severity="error">Super admin access is required.</Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Role</Typography>
            <Typography variant="h6">{settingsQuery.data?.role ?? 'N/A'}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Permissions scope</Typography>
            <Typography variant="h6">
              {settingsQuery.data?.permissions_scope ?? 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Admin users</Typography>
            <Typography variant="h6">{adminsQuery.data?.length ?? 0}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
