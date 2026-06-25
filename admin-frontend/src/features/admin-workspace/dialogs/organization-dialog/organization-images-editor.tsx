import { Box, Button, Paper, Stack, TextField } from '@mui/material'

import { resolveImageUrl } from '@/features/admin-workspace/dialogs/shared'

type OrganizationImagesEditorProps = {
  logoValue: string
  coverValue: string
  isUploadingLogo: boolean
  isUploadingCover: boolean
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onCoverUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onClearLogo: () => void
  onClearCover: () => void
  logoFieldProps: Record<string, unknown>
  coverFieldProps: Record<string, unknown>
  logoError?: string
  coverError?: string
}

export function OrganizationImagesEditor({
  logoValue,
  coverValue,
  isUploadingLogo,
  isUploadingCover,
  onLogoUpload,
  onCoverUpload,
  onClearLogo,
  onClearCover,
  logoFieldProps,
  coverFieldProps,
  logoError,
  coverError,
}: OrganizationImagesEditorProps) {
  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <TextField label="Logo URL" error={Boolean(logoError)} helperText={logoError ?? 'Optional URL or upload an image'} fullWidth {...logoFieldProps} />
        <Button variant="outlined" component="label" disabled={isUploadingLogo} sx={{ height: 40, mt: 0.5, whiteSpace: 'nowrap' }}>
          {isUploadingLogo ? 'Uploading...' : logoValue ? 'Replace' : 'Upload File'}
          <input type="file" accept="image/*" hidden onChange={(event) => void onLogoUpload(event)} />
        </Button>
      </Stack>

      {logoValue ? (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
            <Box component="img" src={resolveImageUrl(logoValue)} alt="Organization logo" sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }} />
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" component="label" disabled={isUploadingLogo}>
                {isUploadingLogo ? 'Uploading...' : 'Change'}
                <input type="file" accept="image/*" hidden onChange={(event) => void onLogoUpload(event)} />
              </Button>
              <Button size="small" color="error" onClick={onClearLogo}>Delete</Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <TextField label="Cover Image URL" error={Boolean(coverError)} helperText={coverError ?? 'Optional URL or upload an image'} fullWidth {...coverFieldProps} />
        <Button variant="outlined" component="label" disabled={isUploadingCover} sx={{ height: 40, mt: 0.5, whiteSpace: 'nowrap' }}>
          {isUploadingCover ? 'Uploading...' : coverValue ? 'Replace' : 'Upload File'}
          <input type="file" accept="image/*" hidden onChange={(event) => void onCoverUpload(event)} />
        </Button>
      </Stack>

      {coverValue ? (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
          <Stack spacing={1.25}>
            <Box component="img" src={resolveImageUrl(coverValue)} alt="Organization cover" sx={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }} />
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button size="small" variant="outlined" component="label" disabled={isUploadingCover}>
                {isUploadingCover ? 'Uploading...' : 'Change'}
                <input type="file" accept="image/*" hidden onChange={(event) => void onCoverUpload(event)} />
              </Button>
              <Button size="small" color="error" onClick={onClearCover}>Delete</Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}
    </>
  )
}
