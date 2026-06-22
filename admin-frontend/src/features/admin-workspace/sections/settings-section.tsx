import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Button, Paper, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'

import { SectionHeader } from '@/features/admin-workspace/admin-workspace-utils'
import type { AdminWorkspaceSettings } from '@/lib/api-types'

export const SettingsSection = ({
  settings,
  onEditSettings,
}: {
  settings: AdminWorkspaceSettings
  onEditSettings: () => void
}) => (
  <Stack spacing={3}>
    <SectionHeader
      title="Settings"
      description="Maintain profile details, notifications, platform defaults, and security requirements."
      action={<Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={onEditSettings}>Update Settings</Button>}
    />
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Profile Management</Typography>
          <Stack spacing={1.25}>
            <Typography><strong>Name:</strong> {settings.profile.full_name}</Typography>
            <Typography><strong>Title:</strong> {settings.profile.title}</Typography>
            <Typography><strong>Email:</strong> {settings.profile.email}</Typography>
            <Typography><strong>Phone:</strong> {settings.profile.phone}</Typography>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Notification Settings</Typography>
          <Stack spacing={1.25}>
            <Typography>Email notifications: {settings.notifications.email_notifications ? 'Enabled' : 'Disabled'}</Typography>
            <Typography>SMS notifications: {settings.notifications.sms_notifications ? 'Enabled' : 'Disabled'}</Typography>
            <Typography>Weekly report: {settings.notifications.weekly_report ? 'Enabled' : 'Disabled'}</Typography>
            <Typography>Incident alerts: {settings.notifications.incident_alerts ? 'Enabled' : 'Disabled'}</Typography>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Platform Settings</Typography>
          <Stack spacing={1.25}>
            <Typography><strong>Platform:</strong> {settings.platform.platform_name}</Typography>
            <Typography><strong>Support:</strong> {settings.platform.support_email}</Typography>
            <Typography><strong>Timezone:</strong> {settings.platform.timezone}</Typography>
            <Typography><strong>Language:</strong> {settings.platform.default_language}</Typography>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Security Settings</Typography>
          <Stack spacing={1.25}>
            <Typography><strong>Session timeout:</strong> {settings.security.session_timeout_minutes} minutes</Typography>
            <Typography><strong>Password rotation:</strong> {settings.security.password_rotation_days} days</Typography>
            <Typography><strong>MFA required:</strong> {settings.security.require_mfa_for_admins ? 'Yes' : 'No'}</Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  </Stack>
)
