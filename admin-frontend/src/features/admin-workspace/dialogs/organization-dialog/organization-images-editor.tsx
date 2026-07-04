import { Box, Button, Paper, Stack, Typography } from '@mui/material'

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
  hasPendingLogo?: boolean
  hasPendingCover?: boolean
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
  hasPendingLogo = false,
  hasPendingCover = false,
}: OrganizationImagesEditorProps) {
  return (
    <>
      <Stack spacing={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Organization Logo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload your logo image and it will be saved when you submit this form.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Button variant="outlined" component="label" disabled={isUploadingLogo} sx={{ height: 40, whiteSpace: 'nowrap' }}>
          {isUploadingLogo ? 'Uploading...' : logoValue ? 'Replace' : 'Choose Image'}
          <input type="file" accept="image/*" hidden onChange={(event) => void onLogoUpload(event)} />
        </Button>
        </Stack>
      </Stack>

      {logoValue ? (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
            <Box component="img" src={resolveImageUrl(logoValue)} alt="Organization logo" sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }} />
            <Stack spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {hasPendingLogo ? <Box sx={{ color: 'warning.main', fontSize: 12 }}>New logo selected. It will upload when you save.</Box> : null}
              <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" component="label" disabled={isUploadingLogo}>
                {isUploadingLogo ? 'Uploading...' : 'Change'}
                <input type="file" accept="image/*" hidden onChange={(event) => void onLogoUpload(event)} />
              </Button>
              <Button size="small" color="error" onClick={onClearLogo}>Delete</Button>
            </Stack>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      <Stack spacing={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Cover Image
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload a cover image. You will see a preview instead of a URL field.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Button variant="outlined" component="label" disabled={isUploadingCover} sx={{ height: 40, whiteSpace: 'nowrap' }}>
          {isUploadingCover ? 'Uploading...' : coverValue ? 'Replace' : 'Choose Image'}
          <input type="file" accept="image/*" hidden onChange={(event) => void onCoverUpload(event)} />
        </Button>
        </Stack>
      </Stack>

      {coverValue ? (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
          <Stack spacing={1.25}>
            <Box component="img" src={resolveImageUrl(coverValue)} alt="Organization cover" sx={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }} />
            {hasPendingCover ? <Box sx={{ color: 'warning.main', fontSize: 12 }}>New cover selected. It will upload when you save.</Box> : null}
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
