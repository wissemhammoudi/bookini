import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  alpha,
} from '@mui/material'
import { useForm } from 'react-hook-form'

import {
  DialogHeading,
  SettingsDialogProps,
  SettingsFormValues,
  dialogActionsSx,
  dialogContentSx,
  dialogPaperSx,
  settingsSchema,
} from '@/features/admin-workspace/dialogs/shared'

export const SettingsDialog = ({
  error,
  isSubmitting = false,
  onClose,
  onSubmit,
  open,
  value,
}: SettingsDialogProps) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: {
      full_name: value.profile.full_name,
      email: value.profile.email,
      phone: value.profile.phone,
      title: value.profile.title,
      platform_name: value.platform.platform_name,
      support_email: value.platform.support_email,
      timezone: value.platform.timezone,
      default_language: value.platform.default_language,
      session_timeout_minutes: value.security.session_timeout_minutes,
      password_rotation_days: value.security.password_rotation_days,
      email_notifications: value.notifications.email_notifications,
      sms_notifications: value.notifications.sms_notifications,
      weekly_report: value.notifications.weekly_report,
      incident_alerts: value.notifications.incident_alerts,
      require_mfa_for_admins: value.security.require_mfa_for_admins,
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth sx={dialogPaperSx}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
        <DialogHeading tone="System configuration" title="Update Settings" subtitle="Manage workspace identity, notifications, and security defaults in one panel." />
      </DialogTitle>
      <DialogContent dividers sx={dialogContentSx}>
        <Stack
          spacing={2}
          component="form"
          id="settings-form"
          onSubmit={handleSubmit(async (formValues) => {
            await onSubmit({
              profile: {
                full_name: formValues.full_name,
                email: formValues.email,
                phone: formValues.phone,
                title: formValues.title,
              },
              platform: {
                platform_name: formValues.platform_name,
                support_email: formValues.support_email,
                timezone: formValues.timezone,
                default_language: formValues.default_language,
              },
              security: {
                session_timeout_minutes: formValues.session_timeout_minutes,
                password_rotation_days: formValues.password_rotation_days,
                require_mfa_for_admins: formValues.require_mfa_for_admins,
              },
              notifications: {
                email_notifications: formValues.email_notifications,
                sms_notifications: formValues.sms_notifications,
                weekly_report: formValues.weekly_report,
                incident_alerts: formValues.incident_alerts,
              },
            })
          })}
        >
          {error ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert> : null}
          <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', backgroundColor: alpha('#0059B3', 0.025) }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Profile & platform</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Full Name" {...register('full_name')} error={Boolean(errors.full_name)} helperText={errors.full_name?.message} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Title" {...register('title')} error={Boolean(errors.title)} helperText={errors.title?.message} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Email" {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Phone" {...register('phone')} error={Boolean(errors.phone)} helperText={errors.phone?.message} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Platform Name" {...register('platform_name')} error={Boolean(errors.platform_name)} helperText={errors.platform_name?.message} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Support Email" {...register('support_email')} error={Boolean(errors.support_email)} helperText={errors.support_email?.message} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Timezone" {...register('timezone')} error={Boolean(errors.timezone)} helperText={errors.timezone?.message} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Default Language" {...register('default_language')} error={Boolean(errors.default_language)} helperText={errors.default_language?.message} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="number" label="Session Timeout (minutes)" {...register('session_timeout_minutes', { valueAsNumber: true })} error={Boolean(errors.session_timeout_minutes)} helperText={errors.session_timeout_minutes?.message} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="number" label="Password Rotation (days)" {...register('password_rotation_days', { valueAsNumber: true })} error={Boolean(errors.password_rotation_days)} helperText={errors.password_rotation_days?.message} /></Grid>
              </Grid>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', backgroundColor: alpha('#00A88F', 0.025) }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Alerts & security</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
                <FormControlLabel control={<Switch {...register('email_notifications')} defaultChecked={value.notifications.email_notifications} />} label="Email notifications" />
                <FormControlLabel control={<Switch {...register('sms_notifications')} defaultChecked={value.notifications.sms_notifications} />} label="SMS notifications" />
                <FormControlLabel control={<Switch {...register('weekly_report')} defaultChecked={value.notifications.weekly_report} />} label="Weekly reports" />
                <FormControlLabel control={<Switch {...register('incident_alerts')} defaultChecked={value.notifications.incident_alerts} />} label="Incident alerts" />
                <FormControlLabel control={<Switch {...register('require_mfa_for_admins')} defaultChecked={value.security.require_mfa_for_admins} />} label="Require MFA for admins" />
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={dialogActionsSx}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="settings-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save settings'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
