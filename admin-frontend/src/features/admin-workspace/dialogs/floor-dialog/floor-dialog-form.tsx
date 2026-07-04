import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField } from '@mui/material'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { ReservationAreasEditor } from '@/features/admin-workspace/dialogs/floor-dialog/reservation-areas-editor'
import type { UpdateReservationArea } from '@/features/admin-workspace/dialogs/floor-dialog/area-utils'
import { resolveImageUrl } from '@/features/admin-workspace/dialogs/shared'
import type { FloorFormValues } from '@/features/admin-workspace/dialogs/shared'
import type { FloorRecord, PlaceRecord, ReservationAreaRecord } from '@/lib/api-types'

type FloorDialogFormProps = {
  register: UseFormRegister<FloorFormValues>
  errors: FieldErrors<FloorFormValues>
  value?: FloorRecord
  places: PlaceRecord[]
  error?: string
  uploadError?: string | null
  isUploadingBlueprint: boolean
  blueprintValue: string
  hasPendingBlueprint?: boolean
  extractedReservationAreas: ReservationAreaRecord[]
  onBlueprintUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onClearBlueprint: () => void
  onOpenBuilder: () => void
  onReservationAreasInputChange: (value: string) => void
  onExtractReservationAreasFromBlueprint: () => void
  onAddReservationArea: () => void
  onUpdateReservationArea: UpdateReservationArea
  onRemoveReservationArea: (index: number) => void
}

export function FloorDialogForm({
  register,
  errors,
  value,
  places,
  error,
  uploadError,
  isUploadingBlueprint,
  blueprintValue,
  hasPendingBlueprint = false,
  extractedReservationAreas,
  onBlueprintUpload,
  onClearBlueprint,
  onOpenBuilder,
  onReservationAreasInputChange,
  onExtractReservationAreasFromBlueprint,
  onAddReservationArea,
  onUpdateReservationArea,
  onRemoveReservationArea,
}: FloorDialogFormProps) {
  return (
    <Stack spacing={2}>
      {error || uploadError ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error || uploadError}</Alert> : null}

      <TextField select label="Place" defaultValue={value?.place_id ?? places[0]?.id ?? ''} {...register('place_id')} error={Boolean(errors.place_id)} helperText={errors.place_id?.message}>
        {places.map((place) => (
          <MenuItem key={place.id} value={place.id}>{place.name}</MenuItem>
        ))}
      </TextField>

      <TextField label="Floor Name" {...register('floor_name')} error={Boolean(errors.floor_name)} helperText={errors.floor_name?.message} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth type="number" label="Floor Number" {...register('floor_number', { valueAsNumber: true })} error={Boolean(errors.floor_number)} helperText={errors.floor_number?.message} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth type="number" label="Floor Size (sqm)" {...register('floor_size_sqm', { valueAsNumber: true })} error={Boolean(errors.floor_size_sqm)} helperText={errors.floor_size_sqm?.message} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth type="number" label="Capacity" {...register('capacity', { valueAsNumber: true })} error={Boolean(errors.capacity)} helperText={errors.capacity?.message} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth type="number" label="Pricing" {...register('pricing', { valueAsNumber: true })} error={Boolean(errors.pricing)} helperText={errors.pricing?.message} />
        </Grid>
      </Grid>

      <TextField select label="Floor Shape" defaultValue={value?.floor_shape ?? 'RECTANGLE'} {...register('floor_shape')} error={Boolean(errors.floor_shape)} helperText={errors.floor_shape?.message ?? 'Used by Build Floor tooling'}>
        <MenuItem value="SQUARE">Square</MenuItem>
        <MenuItem value="RECTANGLE">Rectangle</MenuItem>
        <MenuItem value="L_SHAPE">L-Shape</MenuItem>
        <MenuItem value="CUSTOM_POLYGON">Custom Polygon</MenuItem>
      </TextField>

      <TextField label="Description" multiline minRows={3} {...register('description')} error={Boolean(errors.description)} helperText={errors.description?.message} />

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <TextField label="Build Floor" {...register('blueprint_image')} error={Boolean(errors.blueprint_image)} helperText={errors.blueprint_image?.message ?? 'Optional floor image URL, upload, or paste floor layout JSON array'} fullWidth />
        <Button variant="outlined" component="label" disabled={isUploadingBlueprint} sx={{ height: 40, mt: 0.5, whiteSpace: 'nowrap' }}>
          {isUploadingBlueprint ? 'Uploading...' : blueprintValue ? 'Replace' : 'Choose Image'}
          <input type="file" accept="image/*" hidden onChange={(event) => void onBlueprintUpload(event)} />
        </Button>
        <Button variant="contained" onClick={onOpenBuilder} sx={{ height: 40, mt: 0.5, whiteSpace: 'nowrap' }}>Open Builder</Button>
      </Stack>

      {blueprintValue ? (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
          <Stack spacing={1.25}>
            <Box component="img" src={resolveImageUrl(blueprintValue)} alt="Floor blueprint" sx={{ width: '100%', maxHeight: 190, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }} />
            {hasPendingBlueprint ? <Box sx={{ color: 'warning.main', fontSize: 12 }}>New blueprint selected. It will upload when you save.</Box> : null}
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button size="small" variant="outlined" component="label" disabled={isUploadingBlueprint}>
                {isUploadingBlueprint ? 'Uploading...' : 'Change'}
                <input type="file" accept="image/*" hidden onChange={(event) => void onBlueprintUpload(event)} />
              </Button>
              <Button size="small" color="error" onClick={onClearBlueprint}>Delete</Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'flex-start' } }}>
        <TextField
          label="Reservation Areas"
          {...register('reservation_areas')}
          onChange={(event) => onReservationAreasInputChange(event.target.value)}
          error={Boolean(errors.reservation_areas)}
          helperText={errors.reservation_areas?.message ?? 'Comma separated values'}
          fullWidth
        />
        <Button variant="outlined" onClick={onExtractReservationAreasFromBlueprint} sx={{ height: 40, mt: { sm: 0.5 }, whiteSpace: 'nowrap' }}>
          Extract Reservation Areas
        </Button>
      </Stack>

      <ReservationAreasEditor
        extractedReservationAreas={extractedReservationAreas}
        onAddReservationArea={onAddReservationArea}
        onUpdateReservationArea={onUpdateReservationArea}
        onRemoveReservationArea={onRemoveReservationArea}
      />

      <TextField select label="Status" defaultValue={value?.status ?? 'ACTIVE'} {...register('status')} error={Boolean(errors.status)} helperText={errors.status?.message}>
        <MenuItem value="ACTIVE">Active</MenuItem>
        <MenuItem value="SUSPENDED">Suspended</MenuItem>
      </TextField>
    </Stack>
  )
}
