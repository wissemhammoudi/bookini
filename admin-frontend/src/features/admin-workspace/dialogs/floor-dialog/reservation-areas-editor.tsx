import { Alert, Button, FormControlLabel, Grid, Paper, Stack, Switch, TextField, Typography } from '@mui/material'

import type { UpdateReservationArea } from '@/features/admin-workspace/dialogs/floor-dialog/area-utils'
import type { ReservationAreaRecord } from '@/lib/api-types'

type ReservationAreasEditorProps = {
  extractedReservationAreas: ReservationAreaRecord[]
  onAddReservationArea: () => void
  onUpdateReservationArea: UpdateReservationArea
  onRemoveReservationArea: (index: number) => void
}

export function ReservationAreasEditor({
  extractedReservationAreas,
  onAddReservationArea,
  onUpdateReservationArea,
  onRemoveReservationArea,
}: ReservationAreasEditorProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Reservation Areas
          </Typography>
          <Button size="small" onClick={onAddReservationArea}>Add area</Button>
        </Stack>

        {extractedReservationAreas.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Extract reservation areas from Build Floor JSON, or add areas manually.
          </Alert>
        ) : (
          <Stack spacing={1.5}>
            {extractedReservationAreas.map((area, index) => (
              <Grid key={`${area.name}-${index}`} container spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Room Name"
                    value={area.name}
                    onChange={(event) => onUpdateReservationArea(index, 'name', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Price"
                    value={area.price ?? 0}
                    onChange={(event) => onUpdateReservationArea(index, 'price', Number(event.target.value) || 0)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Includes"
                    value={(area.includes ?? []).join(', ')}
                    onChange={(event) =>
                      onUpdateReservationArea(
                        index,
                        'includes',
                        event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={area.is_reservable !== false} onChange={(event) => onUpdateReservationArea(index, 'is_reservable', event.target.checked)} />}
                    label="Reservable"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 1 }}>
                  <Button color="error" onClick={() => onRemoveReservationArea(index)} sx={{ minWidth: 0, px: 1 }}>
                    Remove
                  </Button>
                </Grid>
              </Grid>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}
