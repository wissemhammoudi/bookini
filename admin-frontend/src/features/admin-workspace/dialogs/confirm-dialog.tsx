import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material'

import {
  DialogHeading,
  dialogActionsSx,
  dialogContentSx,
  dialogPaperSx,
} from '@/features/admin-workspace/dialogs/shared'
import type { ConfirmDialogProps } from '@/features/admin-workspace/dialogs/shared'

export const ConfirmDialog = ({
  color = 'primary',
  confirmLabel,
  description,
  error,
  isSubmitting = false,
  onClose,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth sx={dialogPaperSx}>
    <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
      <DialogHeading tone="Confirmation" title={title} subtitle="Review the action before it is applied to the admin workspace." />
    </DialogTitle>
    <DialogContent dividers sx={dialogContentSx}>
      <Stack spacing={2}>
        {error ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert> : null}
        <Alert severity={color === 'error' ? 'warning' : 'info'} sx={{ borderRadius: 2 }}>{description}</Alert>
      </Stack>
    </DialogContent>
    <DialogActions sx={dialogActionsSx}>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" color={color} disabled={isSubmitting} onClick={() => void onConfirm()}>
        {isSubmitting ? 'Working...' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
)
