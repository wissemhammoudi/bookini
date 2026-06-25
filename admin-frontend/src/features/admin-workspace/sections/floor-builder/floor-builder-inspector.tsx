import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'

import type { DeskZone, ElementType } from '@/features/admin-workspace/sections/floor-builder/floor-layout-utils'

type FloorBuilderInspectorProps = {
  selectedDesk: DeskZone | null
  selectedIndex: number | null
  isUploadingRoomImages: boolean
  roomImageError: string | null
  onUploadRoomImages: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onUpdateSelected: <K extends keyof DeskZone>(field: K, val: DeskZone[K]) => void
  onRemoveRoomImage: (targetIndex: number) => void
  onDeleteDesk: (index: number) => void
}

export function FloorBuilderInspector({
  selectedDesk,
  selectedIndex,
  isUploadingRoomImages,
  roomImageError,
  onUploadRoomImages,
  onUpdateSelected,
  onRemoveRoomImage,
  onDeleteDesk,
}: FloorBuilderInspectorProps) {
  if (!selectedDesk || selectedIndex === null) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Click any room or area on the canvas to inspect, rotate, or modify its properties. Or choose a room from the Toolbox to add it.
      </Alert>
    )
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2, borderColor: 'primary.main', border: '1.5px solid' }}>
      <Typography sx={{ fontWeight: 800, mb: 2 }} color="primary">
        Room / Area Properties
      </Typography>
      <Stack spacing={2}>
        {roomImageError ? <Alert severity="error">{roomImageError}</Alert> : null}

        <TextField label="Room / Area Name" size="small" value={selectedDesk.name} onChange={(event) => onUpdateSelected('name', event.target.value)} />

        <TextField
          select
          label="Room Type"
          size="small"
          value={selectedDesk.type || 'desk'}
          onChange={(event) => onUpdateSelected('type', event.target.value as ElementType)}
        >
          <MenuItem value="desk">Private Office / Focus Room</MenuItem>
          <MenuItem value="table">Meeting / Conference Room</MenuItem>
          <MenuItem value="chair">Lounge Area</MenuItem>
          <MenuItem value="projector">Presentation / Media Room</MenuItem>
          <MenuItem value="plant">Open Workspace</MenuItem>
          <MenuItem value="door">Office Area</MenuItem>
          <MenuItem value="wall">Collaboration Space</MenuItem>
        </TextField>

        <TextField
          select
          label="Rotation"
          size="small"
          value={selectedDesk.rotation || 0}
          onChange={(event) => onUpdateSelected('rotation', Number(event.target.value))}
        >
          <MenuItem value={0}>0° (Horizontal)</MenuItem>
          <MenuItem value={90}>90° (Vertical)</MenuItem>
          <MenuItem value={180}>180°</MenuItem>
          <MenuItem value={270}>270°</MenuItem>
        </TextField>

        <FormControlLabel
          control={<Switch checked={selectedDesk.isReservable !== false} onChange={(event) => onUpdateSelected('isReservable', event.target.checked)} color="primary" />}
          label="Reservable Area"
        />

        <TextField
          label="Area Hourly Price"
          type="number"
          size="small"
          value={selectedDesk.price}
          onChange={(event) => onUpdateSelected('price', Number(event.target.value) || 0)}
        />

        <TextField
          label="Includes"
          size="small"
          value={selectedDesk.includes.join(', ')}
          onChange={(event) => {
            const values = event.target.value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
            onUpdateSelected('includes', values)
          }}
          helperText="Comma separated features included with this area"
        />

        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
          <TextField
            label="Room Image URLs"
            size="small"
            value={(selectedDesk.image_urls ?? []).join(', ')}
            onChange={(event) => {
              const values = event.target.value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
              onUpdateSelected('image_urls', values)
            }}
            helperText="Comma separated image URLs"
            fullWidth
          />
          <Button variant="outlined" component="label" disabled={isUploadingRoomImages} sx={{ height: 40, whiteSpace: 'nowrap', mt: 0.25 }}>
            {isUploadingRoomImages ? 'Uploading...' : 'Upload'}
            <input type="file" accept="image/*" multiple hidden onChange={(event) => void onUploadRoomImages(event)} />
          </Button>
        </Stack>

        {(selectedDesk.image_urls ?? []).length > 0 ? (
          <Stack spacing={1}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
              Room Images
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.75 }}>
              {(selectedDesk.image_urls ?? []).map((imageUrl, imageIndex) => (
                <Paper key={`${imageUrl}-${imageIndex}`} variant="outlined" sx={{ p: 0.5, borderRadius: 1.5 }}>
                  <Stack spacing={0.5}>
                    <Box component="img" src={imageUrl} alt={`Room image ${imageIndex + 1}`} sx={{ width: '100%', height: 56, objectFit: 'cover', borderRadius: 1 }} />
                    <Button size="small" color="error" onClick={() => onRemoveRoomImage(imageIndex)}>
                      Remove
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Stack>
        ) : null}

        <Stack direction="row" spacing={1}>
          <TextField label="Width (px)" type="number" size="small" value={selectedDesk.w} onChange={(event) => onUpdateSelected('w', Number(event.target.value))} />
          <TextField label="Height (px)" type="number" size="small" value={selectedDesk.h} onChange={(event) => onUpdateSelected('h', Number(event.target.value))} />
        </Stack>

        <Stack direction="row" spacing={1}>
          <TextField label="X Pos" type="number" size="small" value={selectedDesk.x} onChange={(event) => onUpdateSelected('x', Number(event.target.value))} />
          <TextField label="Y Pos" type="number" size="small" value={selectedDesk.y} onChange={(event) => onUpdateSelected('y', Number(event.target.value))} />
        </Stack>

        <Button variant="outlined" color="error" size="small" onClick={() => onDeleteDesk(selectedIndex)} startIcon={<DeleteOutlineOutlinedIcon />}>
          Delete Room / Area
        </Button>
      </Stack>
    </Paper>
  )
}
