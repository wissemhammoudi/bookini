import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'

import { resolveImageUrl } from '@/features/admin-workspace/dialogs/shared'

type PlaceImagesEditorProps = {
  coverValue: string
  galleryItems: string[]
  isUploadingCover: boolean
  isUploadingGallery: boolean
  onCoverUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onGalleryUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onClearCover: () => void
  onRemoveGalleryItem: (targetIndex: number) => void
  coverFieldProps: Record<string, unknown>
  galleryFieldProps: Record<string, unknown>
  coverError?: string
  galleryError?: string
  hasPendingCover?: boolean
  pendingGalleryCount?: number
}

export function PlaceImagesEditor({
  coverValue,
  galleryItems,
  isUploadingCover,
  isUploadingGallery,
  onCoverUpload,
  onGalleryUpload,
  onClearCover,
  onRemoveGalleryItem,
  coverFieldProps,
  galleryFieldProps,
  coverError,
  galleryError,
  hasPendingCover = false,
  pendingGalleryCount = 0,
}: PlaceImagesEditorProps) {
  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <TextField label="Cover Image URL" error={Boolean(coverError)} helperText={coverError ?? 'Optional URL or upload an image'} fullWidth {...coverFieldProps} />
        <Button variant="outlined" component="label" disabled={isUploadingCover} sx={{ height: 40, mt: 0.5, whiteSpace: 'nowrap' }}>
          {isUploadingCover ? 'Uploading...' : coverValue ? 'Replace' : 'Choose Image'}
          <input type="file" accept="image/*" hidden onChange={(event) => void onCoverUpload(event)} />
        </Button>
      </Stack>

      {coverValue ? (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
          <Stack spacing={1.25}>
            <Box component="img" src={resolveImageUrl(coverValue)} alt="Place cover" sx={{ width: '100%', maxHeight: 190, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }} />
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

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <TextField
          label="Gallery URLs"
          error={Boolean(galleryError)}
          helperText={galleryError ?? 'Comma separated URLs or upload multiple images'}
          fullWidth
          {...galleryFieldProps}
        />
        <Button variant="outlined" component="label" disabled={isUploadingGallery} sx={{ height: 40, mt: 0.5, whiteSpace: 'nowrap' }}>
          {isUploadingGallery ? 'Uploading...' : 'Choose Gallery'}
          <input type="file" accept="image/*" multiple hidden onChange={(event) => void onGalleryUpload(event)} />
        </Button>
      </Stack>

      {galleryItems.length > 0 ? (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
          <Stack spacing={1.25}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Gallery Preview
            </Typography>
            {pendingGalleryCount > 0 ? <Box sx={{ color: 'warning.main', fontSize: 12 }}>{pendingGalleryCount} new image(s) selected. They will upload when you save.</Box> : null}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>
              {galleryItems.map((imageUrl, index) => (
                <Paper key={`${imageUrl}-${index}`} variant="outlined" sx={{ p: 0.75, borderRadius: 2 }}>
                  <Stack spacing={0.75}>
                    <Box component="img" src={resolveImageUrl(imageUrl)} alt={`Gallery image ${index + 1}`} sx={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 1.5, backgroundColor: 'background.default' }} />
                    <Button size="small" color="error" onClick={() => onRemoveGalleryItem(index)}>Remove</Button>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Stack>
        </Paper>
      ) : null}
    </>
  )
}
