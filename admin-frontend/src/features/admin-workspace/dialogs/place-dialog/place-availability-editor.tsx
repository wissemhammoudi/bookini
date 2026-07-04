import { Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { availabilityDayOptions } from '@/features/admin-workspace/dialogs/shared'
import type { PlaceFormValues } from '@/features/admin-workspace/dialogs/shared'

type PlaceAvailabilityEditorProps = {
  register: UseFormRegister<PlaceFormValues>
  errors: FieldErrors<PlaceFormValues>
  availabilityValue: PlaceFormValues['availability']
  onAddAvailabilitySlot: () => void
  onRemoveAvailabilitySlot: (index: number) => void
}

export function PlaceAvailabilityEditor({
  register,
  errors,
  availabilityValue,
  onAddAvailabilitySlot,
  onRemoveAvailabilitySlot,
}: PlaceAvailabilityEditorProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">Availability (Monday-Saturday)</Typography>
          <Button size="small" onClick={onAddAvailabilitySlot}>Add slot</Button>
        </Stack>

        {availabilityValue.map((_, index) => {
          const slotError = errors.availability?.[index]
          return (
            <Grid key={`availability-${index}`} container spacing={1.25} sx={{ alignItems: 'flex-start' }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Day"
                  defaultValue={availabilityValue[index]?.day ?? 'MONDAY'}
                  {...register(`availability.${index}.day` as const)}
                  error={Boolean(slotError?.day)}
                  helperText={slotError?.day?.message}
                >
                  {availabilityDayOptions.map((dayOption) => (
                    <MenuItem key={dayOption.value} value={dayOption.value}>{dayOption.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="Start"
                  defaultValue={availabilityValue[index]?.start_time ?? '09:00'}
                  {...register(`availability.${index}.start_time` as const)}
                  error={Boolean(slotError?.start_time)}
                  helperText={slotError?.start_time?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="End"
                  defaultValue={availabilityValue[index]?.end_time ?? '17:00'}
                  {...register(`availability.${index}.end_time` as const)}
                  error={Boolean(slotError?.end_time)}
                  helperText={slotError?.end_time?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button
                  fullWidth
                  color="error"
                  variant="outlined"
                  disabled={availabilityValue.length <= 1}
                  onClick={() => onRemoveAvailabilitySlot(index)}
                  sx={{ height: 56 }}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          )
        })}

        {typeof errors.availability?.message === 'string' ? (
          <Typography variant="caption" color="error">{errors.availability.message}</Typography>
        ) : null}
      </Stack>
    </Paper>
  )
}
