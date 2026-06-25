import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { useForm } from 'react-hook-form'

import {
  DialogHeading,
  dialogActionsSx,
  dialogContentSx,
  dialogPaperSx,
  userSchema,
} from '@/features/admin-workspace/dialogs/shared'
import type {
  UserDialogProps,
  UserFormValues,
} from '@/features/admin-workspace/dialogs/shared'

export const UserDialog = ({
  error,
  isSubmitting = false,
  onClose,
  onSubmit,
  open,
  organizations,
  title,
  value,
}: UserDialogProps) => {
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(() => value?.organization_ids ?? [])

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    values: {
      full_name: value?.full_name ?? '',
      email: value?.email ?? '',
      phone: value?.phone ?? '',
      role: value?.role ?? 'USER',
      status: value?.status ?? 'ACTIVE',
    },
  })

  const [prevOpen, setPrevOpen] = useState(open)
  const [prevValue, setPrevValue] = useState(value)

  if (open !== prevOpen || value !== prevValue) {
    setPrevOpen(open)
    setPrevValue(value)
    if (open) {
      setSelectedOrgs(value?.organization_ids ?? [])
    }
  }

  const handleClose = () => {
    reset()
    setSelectedOrgs([])
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={dialogPaperSx}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
        <DialogHeading
          tone="User access"
          title={title}
          subtitle="Create or update an account with role, status, and organization context."
        />
      </DialogTitle>
      <DialogContent dividers sx={dialogContentSx}>
        <Stack
          spacing={2}
          component="form"
          id="user-form"
          onSubmit={handleSubmit(async (formValues) => {
            await onSubmit({
              ...formValues,
              organization_ids: selectedOrgs,
            })
          })}
        >
          {error ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert> : null}
          <TextField label="Full Name" {...register('full_name')} error={Boolean(errors.full_name)} helperText={errors.full_name?.message} />
          <TextField label="Email" {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} />
          <TextField label="Phone" {...register('phone')} error={Boolean(errors.phone)} helperText={errors.phone?.message} />
          <TextField select label="Role" defaultValue={value?.role ?? 'USER'} {...register('role')} error={Boolean(errors.role)} helperText={errors.role?.message}>
            <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
            <MenuItem value="ADMIN">Organization Admin</MenuItem>
            <MenuItem value="USER">Regular User</MenuItem>
          </TextField>
          <TextField select label="Status" defaultValue={value?.status ?? 'ACTIVE'} {...register('status')} error={Boolean(errors.status)} helperText={errors.status?.message}>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="SUSPENDED">Suspended</MenuItem>
          </TextField>
          <TextField
            select
            label="Organizations"
            value={selectedOrgs}
            onChange={(e) => setSelectedOrgs(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]))}
            slotProps={{
              select: {
                multiple: true,
                renderValue: (selected: unknown) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((val) => {
                      const org = organizations.find((o) => o.id === val)
                      return <Chip key={val} label={org?.name ?? val} size="small" />
                    })}
                  </Box>
                ),
              },
            }}
            helperText="Optional for super admins and regular users"
          >
            {organizations.map((organization) => (
              <MenuItem key={organization.id} value={organization.id}>
                {organization.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={dialogActionsSx}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="user-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save user'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
