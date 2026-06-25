import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { useForm } from 'react-hook-form'

import { OrganizationImagesEditor } from '@/features/admin-workspace/dialogs/organization-dialog/organization-images-editor'
import { useOrganizationDialogState } from '@/features/admin-workspace/dialogs/organization-dialog/use-organization-dialog-state'
import {
  DialogHeading,
  dialogActionsSx,
  dialogContentSx,
  dialogPaperSx,
  organizationSchema,
} from '@/features/admin-workspace/dialogs/shared'
import type { OrganizationDialogProps, OrganizationFormValues } from '@/features/admin-workspace/dialogs/shared'

export const OrganizationDialog = ({
  error,
  isSubmitting = false,
  onClose,
  onSubmit,
  open,
  title,
  value,
}: OrganizationDialogProps) => {
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    values: {
      name: value?.name ?? '',
      description: value?.description ?? '',
      address: value?.address ?? '',
      contact_email: value?.contact_email ?? '',
      contact_phone: value?.contact_phone ?? '',
      website: value?.website ?? '',
      logo: value?.logo ?? '',
      cover_image: value?.cover_image ?? '',
      social_links: value?.social_links.join(', ') ?? '',
      status: value?.status ?? 'ACTIVE',
    },
  })
  const {
    isUploadingLogo,
    isUploadingCover,
    uploadError,
    logoValue,
    coverValue,
    handleLogoUpload,
    handleCoverUpload,
    handleClose,
  } = useOrganizationDialogState({
    setValue,
    watch,
    reset,
    onClose,
  })

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth sx={dialogPaperSx}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
        <DialogHeading
          tone="Organization profile"
          title={title}
          subtitle="Capture the organization identity, contact details, and public presence."
        />
      </DialogTitle>
      <DialogContent dividers sx={dialogContentSx}>
        <Stack
          spacing={2}
          component="form"
          id="organization-form"
          onSubmit={handleSubmit(async (formValues) => {
            await onSubmit({
              ...formValues,
              website: formValues.website || undefined,
              logo: formValues.logo || undefined,
              cover_image: formValues.cover_image || undefined,
              social_links: formValues.social_links
                .split(',')
                .map((item: string) => item.trim())
                .filter(Boolean),
            })
          })}
        >
          {error || uploadError ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error || uploadError}</Alert> : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Organization Name" {...register('name')} error={Boolean(errors.name)} helperText={errors.name?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Contact Email" {...register('contact_email')} error={Boolean(errors.contact_email)} helperText={errors.contact_email?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Contact Phone" {...register('contact_phone')} error={Boolean(errors.contact_phone)} helperText={errors.contact_phone?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth select label="Status" defaultValue={value?.status ?? 'ACTIVE'} {...register('status')} error={Boolean(errors.status)} helperText={errors.status?.message}>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <TextField label="Address" {...register('address')} error={Boolean(errors.address)} helperText={errors.address?.message} />
          <TextField label="Description" multiline minRows={3} {...register('description')} error={Boolean(errors.description)} helperText={errors.description?.message} />
          <TextField label="Website" {...register('website')} error={Boolean(errors.website)} helperText={errors.website?.message ?? 'Optional'} />

          <OrganizationImagesEditor
            logoValue={logoValue}
            coverValue={coverValue}
            isUploadingLogo={isUploadingLogo}
            isUploadingCover={isUploadingCover}
            onLogoUpload={handleLogoUpload}
            onCoverUpload={handleCoverUpload}
            onClearLogo={() => setValue('logo', '')}
            onClearCover={() => setValue('cover_image', '')}
            logoFieldProps={register('logo') as Record<string, unknown>}
            coverFieldProps={register('cover_image') as Record<string, unknown>}
            logoError={errors.logo?.message}
            coverError={errors.cover_image?.message}
          />

          <TextField label="Social Links" {...register('social_links')} error={Boolean(errors.social_links)} helperText={errors.social_links?.message ?? 'Comma separated URLs'} />
        </Stack>
      </DialogContent>
      <DialogActions sx={dialogActionsSx}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="organization-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save organization'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
