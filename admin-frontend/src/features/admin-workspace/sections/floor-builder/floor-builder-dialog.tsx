import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Stack, Typography } from '@mui/material'

import { FloorBuilderCanvas } from '@/features/admin-workspace/sections/floor-builder/floor-builder-canvas'
import { FloorBuilderInspector } from '@/features/admin-workspace/sections/floor-builder/floor-builder-inspector'
import { FloorBuilderToolbox } from '@/features/admin-workspace/sections/floor-builder/floor-builder-toolbox'
import { useFloorBuilderState } from '@/features/admin-workspace/sections/floor-builder/use-floor-builder-state'
import type { DeskZone } from '@/features/admin-workspace/sections/floor-builder/floor-layout-utils'
import type { FloorRecord } from '@/lib/api-types'

type FloorBuilderDialogProps = {
  open: boolean
  floor: FloorRecord
  onClose: () => void
  onSave: (desks: DeskZone[]) => Promise<void>
  isSaving: boolean
  desksState?: DeskZone[]
  onDesksStateChange?: (desks: DeskZone[]) => void
}

export function FloorBuilderDialog({
  open,
  floor,
  onClose,
  onSave,
  isSaving,
  desksState,
  onDesksStateChange,
}: FloorBuilderDialogProps) {
  const {
    desks,
    selectedDesk,
    selectedIndex,
    isUploadingRoomImages,
    roomImageError,
    handleAddTemplate,
    handleDeleteDesk,
    handleRemoveRoomImage,
    handleResizeDesk,
    handleRotateSelected,
    handleSelectDesk,
    handleUpdateSelected,
    handleUploadSelectedRoomImages,
  } = useFloorBuilderState({
    floor,
    desksState,
    onDesksStateChange,
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Build Floor Layout - {floor.floor_name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack spacing={2.5}>
              <FloorBuilderToolbox onAddTemplate={handleAddTemplate} />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FloorBuilderCanvas
              desks={desks}
              selectedIndex={selectedIndex}
              onSelectDesk={handleSelectDesk}
              onResizeDesk={handleResizeDesk}
              onRotateSelected={handleRotateSelected}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Stack spacing={2.5}>
              <FloorBuilderInspector
                selectedDesk={selectedDesk}
                selectedIndex={selectedIndex}
                isUploadingRoomImages={isUploadingRoomImages}
                roomImageError={roomImageError}
                onUploadRoomImages={handleUploadSelectedRoomImages}
                onUpdateSelected={handleUpdateSelected}
                onRemoveRoomImage={handleRemoveRoomImage}
                onDeleteDesk={handleDeleteDesk}
              />
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => void onSave(desks)} disabled={isSaving}>
          {isSaving ? 'Saving floor layout...' : 'Save Floor Layout'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
