import { Box, Button, Chip, Dialog as MuiDialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'

import type { BookingType, FloorRoomPreview } from '../floor-details-utils'

type FloorAreaDetailsDialogProps = {
  area: FloorRoomPreview | null
  bookingType: BookingType
  isLight: boolean
  onClose: () => void
  onSelectArea: (areaName: string) => void
}

export const FloorAreaDetailsDialog = ({ area, bookingType, isLight, onClose, onSelectArea }: FloorAreaDetailsDialogProps) => (
  <MuiDialog
    open={Boolean(area)}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    sx={{
      '& .MuiDialog-paper': {
        borderRadius: 3,
        background: isLight ? '#ffffff' : 'rgba(10, 14, 26, 0.95)',
      },
    }}
  >
    <DialogTitle sx={{ fontWeight: 800 }}>{area?.name} Details</DialogTitle>
    <DialogContent dividers>
      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Pricing
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            {area?.price} TND/hour
          </Typography>
        </Box>
        {area?.includes && area.includes.length > 0 ? (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Features Included
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
              {area.includes.map((feature) => (
                <Chip key={feature} size="small" label={feature} variant="outlined" />
              ))}
            </Stack>
          </Box>
        ) : null}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="outlined">
        Close
      </Button>
      {bookingType === 'SELECTED_AREAS' ? (
        <Button
          variant="contained"
          onClick={() => {
            if (area) {
              onSelectArea(area.name)
            }
          }}
        >
          Select Area
        </Button>
      ) : null}
    </DialogActions>
  </MuiDialog>
)
