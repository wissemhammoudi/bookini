import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined'
import { Avatar, Box, Button, Chip, Paper, Stack, Typography, alpha } from '@mui/material'

import { StatusChip } from '@/features/admin-workspace/admin-workspace-utils'
import { getElementColors, getElementIcon } from '@/features/admin-workspace/sections/floor-builder/floor-layout-visuals'
import { asAreaRecord, parseBlueprintLayout } from '@/features/admin-workspace/sections/floor-builder/floor-layout-utils'
import type { FloorActionHandler } from '@/features/admin-workspace/admin-workspace-types'
import type { FloorRecord, PlaceRecord } from '@/lib/api-types'

type FloorCardProps = {
  floor: FloorRecord
  place?: PlaceRecord
  onEditFloor: FloorActionHandler
  onDeleteFloor: FloorActionHandler
  onBuildFloor: (floor: FloorRecord) => void
}

const renderBlueprintPreview = (layoutDesks: ReturnType<typeof parseBlueprintLayout> extends infer T ? T extends (infer U)[] ? U[] : never : never) => (
  <Box
    sx={{
      width: 96,
      height: 96,
      position: 'relative',
      border: '1.5px solid',
      borderColor: 'divider',
      borderRadius: 1.5,
      backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#fafbfc' : '#0e1525'),
      backgroundImage: (theme) =>
        theme.palette.mode === 'light'
          ? 'radial-gradient(circle, #cbd5e1 0.75px, transparent 0.75px)'
          : 'radial-gradient(circle, #334155 0.75px, transparent 0.75px)',
      backgroundSize: '8px 8px',
      overflow: 'hidden',
    }}
  >
    {layoutDesks.map((desk, index) => {
      const scale = 0.192
      const type = desk.type || 'desk'
      const rotation = desk.rotation || 0
      const colors = getElementColors(type, false)

      return (
        <Box
          key={index}
          sx={{
            position: 'relative',
            left: desk.x * scale,
            top: desk.y * scale,
            width: desk.w * scale,
            height: desk.h * scale,
            backgroundColor: colors.bg,
            border: '1px solid',
            borderColor: colors.border,
            borderRadius: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${rotation}deg)`,
            overflow: 'hidden',
          }}
        >
          {getElementIcon(type, 'small')}
        </Box>
      )
    })}
  </Box>
)

export function FloorCard({ floor, place, onEditFloor, onDeleteFloor, onBuildFloor }: FloorCardProps) {
  const parsedLayout = parseBlueprintLayout(floor.blueprint_image)

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.98))'
            : 'linear-gradient(180deg, rgba(16,29,50,0.98), rgba(12,21,37,0.98))',
      }}
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {parsedLayout ? (
            renderBlueprintPreview(parsedLayout)
          ) : (
            <Avatar src={floor.blueprint_image || undefined} variant="rounded" sx={{ width: 96, height: 96, borderRadius: 4 }} />
          )}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6">{floor.floor_name}</Typography>
                <Typography color="text.secondary">
                  {place?.name ?? 'Unknown place'} · Floor {floor.floor_number}
                </Typography>
              </Box>
              <StatusChip value={floor.status} />
            </Stack>
            <Typography sx={{ mt: 1 }}>{floor.description}</Typography>
          </Box>
        </Stack>

        <Typography variant="body2">
          Capacity: {floor.capacity} · Price: ${floor.pricing.toFixed(2)} · Size: {floor.floor_size_sqm ?? 100} sqm · Shape: {(floor.floor_shape ?? 'RECTANGLE').replace('_', ' ')}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {floor.reservation_areas.map((area) => {
            const areaRecord = asAreaRecord(area)
            return (
              <Chip
                key={areaRecord.name}
                label={`${areaRecord.name} • $${areaRecord.price.toFixed(2)}${areaRecord.includes.length ? ` • ${areaRecord.includes.join(' / ')}` : ''}`}
                variant="outlined"
                sx={{ backgroundColor: alpha('#0059B3', 0.04) }}
              />
            )
          })}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button startIcon={<GridOnOutlinedIcon />} onClick={() => onBuildFloor(floor)}>
            Build Floor
          </Button>
          <Button startIcon={<EditOutlinedIcon />} onClick={() => onEditFloor(floor)}>
            Edit
          </Button>
          <Button color="error" startIcon={<DeleteOutlineOutlinedIcon />} onClick={() => onDeleteFloor(floor)}>
            Delete
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
