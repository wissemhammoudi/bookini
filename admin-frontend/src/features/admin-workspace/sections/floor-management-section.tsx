import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import RotateRightOutlinedIcon from '@mui/icons-material/RotateRightOutlined'
import DeskOutlinedIcon from '@mui/icons-material/DeskOutlined'
import TableBarOutlinedIcon from '@mui/icons-material/TableBarOutlined'
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined'
import CastConnectedOutlinedIcon from '@mui/icons-material/CastConnectedOutlined'
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined'
import DoorBackOutlinedIcon from '@mui/icons-material/DoorBackOutlined'
import BorderAllOutlinedIcon from '@mui/icons-material/BorderAllOutlined'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Switch,
  FormControlLabel,
  MenuItem,
} from '@mui/material'
import type { Theme } from '@mui/material'
import Grid from '@mui/material/Grid'

import type { FloorActionHandler } from '@/features/admin-workspace/admin-workspace-types'
import { EmptyState, SectionHeader, StatusChip } from '@/features/admin-workspace/admin-workspace-utils'
import type { FloorRecord, PlaceRecord, ReservationAreaRecord } from '@/lib/api-types'
import { updateWorkspaceFloor, uploadImageRequest } from '@/lib/api'
import { workspaceQueryKey } from '@/features/admin-workspace/admin-workspace-config'

type ElementType = 'desk' | 'table' | 'chair' | 'projector' | 'plant' | 'door' | 'wall'

type DeskZone = {
  name: string
  x: number
  y: number
  w: number
  h: number
  price: number
  includes: string[]
  type?: ElementType
  rotation?: number
  isReservable?: boolean
  image_urls?: string[]
}

const asAreaRecord = (area: string | ReservationAreaRecord): ReservationAreaRecord => {
  if (typeof area === 'string') {
    return {
      name: area,
      price: 0,
      includes: [],
      is_reservable: true,
    }
  }

  return {
    name: area.name,
    price: area.price ?? 0,
    includes: area.includes ?? [],
    is_reservable: area.is_reservable !== false,
    geometry: area.geometry,
  }
}

const parseBlueprintLayout = (blueprintImage?: string | null): DeskZone[] | null => {
  if (!blueprintImage) return null

  const source = blueprintImage.trim()
  if (!source.startsWith('[')) return null

  try {
    const parsed = JSON.parse(source)
    if (!Array.isArray(parsed)) return null

    const layout = parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && typeof item.name === 'string')
      .map((item) => ({
        name: String(item.name),
        x: Number(item.x ?? 0),
        y: Number(item.y ?? 0),
        w: Number(item.w ?? 90),
        h: Number(item.h ?? 60),
        price: Number(item.price ?? 0),
        includes: Array.isArray(item.includes)
          ? item.includes.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
          : [],
        type: (item.type as ElementType | undefined) ?? 'desk',
        rotation: Number(item.rotation ?? 0),
        isReservable: item.isReservable === false ? false : true,
        image_urls: Array.isArray(item.image_urls)
          ? item.image_urls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
          : [],
      }))

    return layout.length ? layout : null
  } catch {
    return null
  }
}

const TOOLBOX_TEMPLATES = [
  { type: 'desk', label: 'Work Desk', w: 90, h: 60, isReservable: true, category: 'Furniture' },
  { type: 'table', label: 'Meeting Table', w: 140, h: 80, isReservable: true, category: 'Furniture' },
  { type: 'chair', label: 'Office Chair', w: 45, h: 45, isReservable: false, category: 'Furniture' },
  { type: 'projector', label: 'Projector/Screen', w: 100, h: 40, isReservable: false, category: 'Equipment' },
  { type: 'plant', label: 'Office Plant', w: 40, h: 40, isReservable: false, category: 'Decor' },
  { type: 'wall', label: 'Partition Wall', w: 120, h: 20, isReservable: false, category: 'Structure' },
  { type: 'door', label: 'Office Door', w: 60, h: 20, isReservable: false, category: 'Structure' },
] as const

const getElementIcon = (type: string, size: 'small' | 'medium' = 'medium') => {
  const sx = { fontSize: size === 'small' ? '12px' : '20px' }
  switch (type) {
    case 'table':
      return <TableBarOutlinedIcon sx={sx} />
    case 'chair':
      return <ChairOutlinedIcon sx={sx} />
    case 'projector':
      return <CastConnectedOutlinedIcon sx={sx} />
    case 'plant':
      return <LocalFloristOutlinedIcon sx={sx} />
    case 'door':
      return <DoorBackOutlinedIcon sx={sx} />
    case 'wall':
      return <BorderAllOutlinedIcon sx={sx} />
    case 'desk':
    default:
      return <DeskOutlinedIcon sx={sx} />
  }
}

const getElementColors = (type: string, isSelected: boolean) => {
  if (isSelected) {
    return {
      border: 'primary.main',
      bg: (theme: Theme) => alpha(theme.palette.primary.main, 0.15),
      shadow: '0 0 10px rgba(0, 89, 179, 0.4)',
      accent: 'primary.main',
    }
  }
  switch (type) {
    case 'plant':
      return {
        border: 'success.main',
        bg: (theme: Theme) => alpha(theme.palette.success.main, 0.08),
        shadow: 'none',
        accent: 'success.main',
      }
    case 'wall':
      return {
        border: '#475569',
        bg: (theme: Theme) => theme.palette.mode === 'light' ? '#cbd5e1' : '#334155',
        shadow: 'none',
        accent: '#475569',
      }
    case 'door':
      return {
        border: '#b45309',
        bg: (theme: Theme) => theme.palette.mode === 'light' ? '#fef3c7' : '#78350f',
        shadow: 'none',
        accent: '#b45309',
      }
    case 'projector':
      return {
        border: 'secondary.main',
        bg: (theme: Theme) => alpha(theme.palette.secondary.main, 0.08),
        shadow: 'none',
        accent: 'secondary.main',
      }
    case 'chair':
      return {
        border: '#6b7280',
        bg: (theme: Theme) => theme.palette.mode === 'light' ? '#f3f4f6' : '#1f2937',
        shadow: 'none',
        accent: '#6b7280',
      }
    case 'table':
      return {
        border: 'info.main',
        bg: (theme: Theme) => alpha(theme.palette.info.main, 0.08),
        shadow: 'none',
        accent: 'info.main',
      }
    case 'desk':
    default:
      return {
        border: '#00A88F',
        bg: () => alpha('#00A88F', 0.08),
        shadow: 'none',
        accent: '#00A88F',
      }
  }
}

type FloorManagementSectionProps = {
  floors: FloorRecord[]
  places: PlaceRecord[]
  search: string
  onSearchChange: (value: string) => void
  onCreateFloor: () => void
  onEditFloor: FloorActionHandler
  onDeleteFloor: FloorActionHandler
}

export function FloorsSection({
  floors,
  places,
  search,
  onSearchChange,
  onCreateFloor,
  onEditFloor,
  onDeleteFloor,
}: FloorManagementSectionProps) {
  const [builderFloor, setBuilderFloor] = useState<FloorRecord | null>(null)
  const queryClient = useQueryClient()

  const saveLayoutMutation = useMutation({
    mutationFn: (payload: { id: string; data: Parameters<typeof updateWorkspaceFloor>[1] }) => updateWorkspaceFloor(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKey })
    },
  })

  const handleSaveLayout = async (desks: DeskZone[]) => {
    if (!builderFloor) return
    try {
      await saveLayoutMutation.mutateAsync({
        id: builderFloor.id,
        data: {
          place_id: builderFloor.place_id,
          floor_name: builderFloor.floor_name,
          floor_number: builderFloor.floor_number,
          floor_size_sqm: builderFloor.floor_size_sqm ?? 100,
          floor_shape: builderFloor.floor_shape ?? 'RECTANGLE',
          capacity: builderFloor.capacity,
          pricing: builderFloor.pricing,
          description: builderFloor.description,
          blueprint_image: JSON.stringify(desks),
          reservation_areas: desks
            .filter((d) => d.isReservable !== false)
            .map((d) => ({
              name: d.name,
              price: d.price,
              includes: d.includes,
              is_reservable: d.isReservable !== false,
              geometry: {
                x: d.x,
                y: d.y,
                w: d.w,
                h: d.h,
                rotation: d.rotation,
                type: d.type,
              },
            })),
          status: builderFloor.status,
        },
      })
      setBuilderFloor(null)
    } catch (e) {
      console.error(e)
      alert('Could not save layout. Please check console.')
    }
  }

  const renderBlueprintPreview = (layoutDesks: DeskZone[]) => (
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
      {layoutDesks.map((d, index) => {
        const scale = 0.192
        const type = d.type || 'desk'
        const rotation = d.rotation || 0
        const colors = getElementColors(type, false)

        return (
          <Box
            key={index}
            sx={{
              position: 'relative',
              left: d.x * scale,
              top: d.y * scale,
              width: d.w * scale,
              height: d.h * scale,
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

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Floor Management"
        description="Configure floor capacity, preview blueprints, and define reservable zones."
        action={
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={onCreateFloor}>
            Create Floor
          </Button>
        }
      />
      <TextField
        fullWidth
        placeholder="Search floor names or descriptions"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {floors.length === 0 ? (
        <EmptyState
          title="No floors available"
          description="Create a floor to demonstrate floor plans and reservation areas."
        />
      ) : (
        <Grid container spacing={2.5}>
          {floors.map((floor) => {
            const place = places.find((item) => item.id === floor.place_id)
            const parsedLayout = parseBlueprintLayout(floor.blueprint_image)

            return (
              <Grid key={floor.id} size={{ xs: 12, lg: 6 }}>
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
                        <Avatar
                          src={floor.blueprint_image || undefined}
                          variant="rounded"
                          sx={{ width: 96, height: 96, borderRadius: 4 }}
                        />
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
                    <Typography variant="body2">Capacity: {floor.capacity} · Price: ${floor.pricing.toFixed(2)} · Size: {floor.floor_size_sqm ?? 100} sqm · Shape: {(floor.floor_shape ?? 'RECTANGLE').replace('_', ' ')}</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {floor.reservation_areas.map((area) => (
                        (() => {
                          const areaRecord = asAreaRecord(area)
                          return (
                        <Chip
                          key={areaRecord.name}
                          label={`${areaRecord.name} • $${areaRecord.price.toFixed(2)}${areaRecord.includes.length ? ` • ${areaRecord.includes.join(' / ')}` : ''}`}
                          variant="outlined"
                          sx={{ backgroundColor: alpha('#0059B3', 0.04) }}
                        />
                          )
                        })()
                      ))}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <Button startIcon={<GridOnOutlinedIcon />} onClick={() => setBuilderFloor(floor)}>
                        Build Floor
                      </Button>
                      <Button startIcon={<EditOutlinedIcon />} onClick={() => onEditFloor(floor)}>
                        Edit
                      </Button>
                      <Button
                        color="error"
                        startIcon={<DeleteOutlineOutlinedIcon />}
                        onClick={() => onDeleteFloor(floor)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      )}

      {builderFloor && (
        <FloorBuilderDialog
          open={Boolean(builderFloor)}
          floor={builderFloor}
          onClose={() => setBuilderFloor(null)}
          onSave={handleSaveLayout}
          isSaving={saveLayoutMutation.isPending}
        />
      )}
    </Stack>
  )
}

type FloorBuilderDialogProps = {
  open: boolean
  floor: FloorRecord
  onClose: () => void
  onSave: (desks: DeskZone[]) => Promise<void>
  isSaving: boolean
}

function FloorBuilderDialog({ open, floor, onClose, onSave, isSaving }: FloorBuilderDialogProps) {
  const [isUploadingRoomImages, setIsUploadingRoomImages] = useState(false)
  const [roomImageError, setRoomImageError] = useState<string | null>(null)
  const [desks, setDesks] = useState<DeskZone[]>(() => {
    const parsedLayout = parseBlueprintLayout(floor.blueprint_image)
    if (parsedLayout) return parsedLayout

    return (floor.reservation_areas ?? []).map((area, idx) => ({
      name: asAreaRecord(area).name,
      x: asAreaRecord(area).geometry?.x ?? 20 + (idx % 4) * 110,
      y: asAreaRecord(area).geometry?.y ?? 20 + Math.floor(idx / 4) * 80,
      w: asAreaRecord(area).geometry?.w ?? 90,
      h: asAreaRecord(area).geometry?.h ?? 60,
      price: asAreaRecord(area).price,
      includes: asAreaRecord(area).includes,
      type: 'desk' as ElementType,
      rotation: asAreaRecord(area).geometry?.rotation ?? 0,
      isReservable: asAreaRecord(area).is_reservable,
      image_urls: [],
    }))
  })

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const selectedDesk = selectedIndex !== null ? desks[selectedIndex] : null

  const handleUploadSelectedRoomImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (selectedIndex === null || !files || files.length === 0) {
      return
    }

    setIsUploadingRoomImages(true)
    setRoomImageError(null)
    try {
      const uploadedUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          const response = await uploadImageRequest(file)
          return response.url
        }),
      )

      const existing = selectedDesk?.image_urls ?? []
      const merged = Array.from(new Set([...existing, ...uploadedUrls]))
      handleUpdateSelected('image_urls', merged)
    } catch (error) {
      const uploadError = error as { response?: { data?: { message?: string } }; message?: string }
      setRoomImageError(uploadError.response?.data?.message || uploadError.message || 'Failed to upload room images')
    } finally {
      setIsUploadingRoomImages(false)
      e.target.value = ''
    }
  }

  const removeSelectedRoomImage = (targetIndex: number) => {
    if (!selectedDesk) return
    const nextImages = (selectedDesk.image_urls ?? []).filter((_, index) => index !== targetIndex)
    handleUpdateSelected('image_urls', nextImages)
  }

  const handleAddTemplate = (template: typeof TOOLBOX_TEMPLATES[number]) => {
    const typeCount = desks.filter((d) => (d.type || 'desk') === template.type).length + 1
    const defaultName = `${template.label} ${typeCount}`

    const newElement: DeskZone = {
      name: defaultName,
      x: 180,
      y: 180,
      w: template.w,
      h: template.h,
      price: floor.pricing,
      includes: [],
      type: template.type,
      rotation: 0,
      isReservable: template.isReservable,
    }

    setDesks((prev) => [...prev, newElement])
    setSelectedIndex(desks.length)
  }

  const handleDeleteDesk = (index: number) => {
    setDesks((prev) => prev.filter((_, i) => i !== index))
    setSelectedIndex(null)
  }

  const handleUpdateSelected = <K extends keyof DeskZone>(field: K, val: DeskZone[K]) => {
    if (selectedIndex === null) return
    setDesks((prev) => {
      const updated = [...prev]
      updated[selectedIndex] = { ...updated[selectedIndex], [field]: val }
      return updated
    })
  }

  const handleRotateSelected = () => {
    if (selectedIndex === null) return
    setDesks((prev) => {
      const updated = [...prev]
      const currentRotation = updated[selectedIndex].rotation || 0
      updated[selectedIndex] = {
        ...updated[selectedIndex],
        rotation: (currentRotation + 90) % 360,
      }
      return updated
    })
  }

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    setSelectedIndex(index)
    const desk = desks[index]
    const startX = e.clientX
    const startY = e.clientY
    const originalX = desk.x
    const originalY = desk.y

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      setDesks((prev) => {
        const updated = [...prev]
        const nextX = Math.max(0, Math.min(500 - desk.w, Math.round((originalX + dx) / 10) * 10))
        const nextY = Math.max(0, Math.min(500 - desk.h, Math.round((originalY + dy) / 10) * 10))
        updated[index] = { ...updated[index], x: nextX, y: nextY }
        return updated
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleResizeMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    const desk = desks[index]
    const startX = e.clientX
    const startY = e.clientY
    const originalW = desk.w
    const originalH = desk.h

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      setDesks((prev) => {
        const updated = [...prev]
        const nextW = Math.max(20, Math.min(500 - desk.x, Math.round((originalW + dx) / 10) * 10))
        const nextH = Math.max(20, Math.min(500 - desk.y, Math.round((originalH + dy) / 10) * 10))
        updated[index] = { ...updated[index], w: nextW, h: nextH }
        return updated
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Build Floor Layout — {floor.floor_name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Left Panel: Toolbox */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack spacing={2.5}>
              <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2, backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.01) }}>
                <Typography sx={{ fontWeight: 800, mb: 2 }}>Toolbox Elements</Typography>

                {/* Furniture Category */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>
                  Furniture
                </Typography>
                <Grid container spacing={1} sx={{ mb: 2.5 }}>
                  {TOOLBOX_TEMPLATES.filter(t => t.category === 'Furniture').map((t) => (
                    <Grid key={t.type} size={{ xs: 6 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleAddTemplate(t)}
                        sx={{
                          height: 72,
                          flexDirection: 'column',
                          borderRadius: 2,
                          textTransform: 'none',
                          p: 1,
                          fontSize: '11px',
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {getElementIcon(t.type)}
                        <Box sx={{ mt: 0.75 }}>{t.label}</Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                {/* Equipment & Decor Category */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>
                  Equipment & Decor
                </Typography>
                <Grid container spacing={1} sx={{ mb: 2.5 }}>
                  {TOOLBOX_TEMPLATES.filter(t => t.category === 'Equipment' || t.category === 'Decor').map((t) => (
                    <Grid key={t.type} size={{ xs: 6 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleAddTemplate(t)}
                        sx={{
                          height: 72,
                          flexDirection: 'column',
                          borderRadius: 2,
                          textTransform: 'none',
                          p: 1,
                          fontSize: '11px',
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {getElementIcon(t.type)}
                        <Box sx={{ mt: 0.75 }}>{t.label}</Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                {/* Structure Category */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>
                  Structure
                </Typography>
                <Grid container spacing={1}>
                  {TOOLBOX_TEMPLATES.filter(t => t.category === 'Structure').map((t) => (
                    <Grid key={t.type} size={{ xs: 6 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleAddTemplate(t)}
                        sx={{
                          height: 72,
                          flexDirection: 'column',
                          borderRadius: 2,
                          textTransform: 'none',
                          p: 1,
                          fontSize: '11px',
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {getElementIcon(t.type)}
                        <Box sx={{ mt: 0.75 }}>{t.label}</Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* Center Canvas */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                width: 500,
                height: 500,
                position: 'relative',
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#fcfdfe' : '#0d131f'),
                backgroundImage: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)'
                    : 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                mx: 'auto',
                overflow: 'hidden',
              }}
            >
              {desks.map((desk, idx) => {
                const isSelected = selectedIndex === idx
                const type = desk.type || 'desk'
                const rotation = desk.rotation || 0
                const colors = getElementColors(type, isSelected)

                return (
                  <Box
                    key={idx}
                    onMouseDown={(e) => handleMouseDown(e, idx)}
                    sx={{
                      position: 'absolute',
                      left: desk.x,
                      top: desk.y,
                      width: desk.w,
                      height: desk.h,
                      backgroundColor: colors.bg,
                      border: '2px solid',
                      borderColor: colors.border,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'move',
                      boxShadow: colors.shadow,
                      userSelect: 'none',
                      p: 0.5,
                      transform: `rotate(${rotation}deg)`,
                      transition: 'transform 0.15s ease-in-out',
                    }}
                  >
                    {isSelected && (
                      <IconButton
                        size="small"
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          handleRotateSelected()
                        }}
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          width: 20,
                          height: 20,
                          zIndex: 10,
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        }}
                      >
                        <RotateRightOutlinedIcon sx={{ fontSize: '11px' }} />
                      </IconButton>
                    )}

                    <Stack spacing={0.5} sx={{ alignItems: 'center', pointerEvents: 'none', width: '100%' }}>
                      {getElementIcon(type)}
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 800, textAlign: 'center', fontSize: '9px', wordBreak: 'break-all', display: desk.w > 40 ? 'block' : 'none' }}
                      >
                        {desk.name}
                      </Typography>
                    </Stack>

                    <Box
                      onMouseDown={(e) => handleResizeMouseDown(e, idx)}
                      sx={{
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        width: 14,
                        height: 14,
                        cursor: 'se-resize',
                        backgroundColor: colors.accent,
                        borderTopLeftRadius: 4,
                        borderBottomRightRadius: 2,
                      }}
                    />
                  </Box>
                )
              })}
            </Box>
          </Grid>

          {/* Right Panel: Inspector */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack spacing={2.5}>
              {selectedDesk && selectedIndex !== null ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 2.25, borderRadius: 2, borderColor: 'primary.main', border: '1.5px solid' }}
                >
                  <Typography sx={{ fontWeight: 800, mb: 2 }} color="primary">
                    Element Properties
                  </Typography>
                  <Stack spacing={2}>
                    {roomImageError ? <Alert severity="error">{roomImageError}</Alert> : null}
                    <TextField
                      label="Element Label"
                      size="small"
                      value={selectedDesk.name}
                      onChange={(e) => handleUpdateSelected('name', e.target.value)}
                    />

                    <TextField
                      select
                      label="Type"
                      size="small"
                      value={selectedDesk.type || 'desk'}
                      onChange={(e) => handleUpdateSelected('type', e.target.value as ElementType)}
                    >
                      <MenuItem value="desk">Work Desk</MenuItem>
                      <MenuItem value="table">Meeting Table</MenuItem>
                      <MenuItem value="chair">Office Chair</MenuItem>
                      <MenuItem value="projector">Projector / Screen</MenuItem>
                      <MenuItem value="plant">Office Plant</MenuItem>
                      <MenuItem value="door">Office Door</MenuItem>
                      <MenuItem value="wall">Partition Wall</MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="Rotation"
                      size="small"
                      value={selectedDesk.rotation || 0}
                      onChange={(e) => handleUpdateSelected('rotation', Number(e.target.value))}
                    >
                      <MenuItem value={0}>0° (Horizontal)</MenuItem>
                      <MenuItem value={90}>90° (Vertical)</MenuItem>
                      <MenuItem value={180}>180°</MenuItem>
                      <MenuItem value={270}>270°</MenuItem>
                    </TextField>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedDesk.isReservable !== false}
                          onChange={(e) => handleUpdateSelected('isReservable', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Reservable Area"
                    />

                    <TextField
                      label="Area Hourly Price"
                      type="number"
                      size="small"
                      value={selectedDesk.price}
                      onChange={(e) => handleUpdateSelected('price', Number(e.target.value) || 0)}
                    />

                    <TextField
                      label="Includes"
                      size="small"
                      value={selectedDesk.includes.join(', ')}
                      onChange={(e) => {
                        const values = e.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean)
                        handleUpdateSelected('includes', values)
                      }}
                      helperText="Comma separated features included with this area"
                    />

                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                      <TextField
                        label="Room Image URLs"
                        size="small"
                        value={(selectedDesk.image_urls ?? []).join(', ')}
                        onChange={(e) => {
                          const values = e.target.value
                            .split(',')
                            .map((item) => item.trim())
                            .filter(Boolean)
                          handleUpdateSelected('image_urls', values)
                        }}
                        helperText="Comma separated image URLs"
                        fullWidth
                      />
                      <Button
                        variant="outlined"
                        component="label"
                        disabled={isUploadingRoomImages}
                        sx={{ height: 40, whiteSpace: 'nowrap', mt: 0.25 }}
                      >
                        {isUploadingRoomImages ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={handleUploadSelectedRoomImages}
                        />
                      </Button>
                    </Stack>

                    {(selectedDesk.image_urls ?? []).length > 0 ? (
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                          Room Images
                        </Typography>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            gap: 0.75,
                          }}
                        >
                          {(selectedDesk.image_urls ?? []).map((imageUrl, imageIndex) => (
                            <Paper key={`${imageUrl}-${imageIndex}`} variant="outlined" sx={{ p: 0.5, borderRadius: 1.5 }}>
                              <Stack spacing={0.5}>
                                <Box
                                  component="img"
                                  src={imageUrl}
                                  alt={`Room image ${imageIndex + 1}`}
                                  sx={{ width: '100%', height: 56, objectFit: 'cover', borderRadius: 1 }}
                                />
                                <Button size="small" color="error" onClick={() => removeSelectedRoomImage(imageIndex)}>
                                  Remove
                                </Button>
                              </Stack>
                            </Paper>
                          ))}
                        </Box>
                      </Stack>
                    ) : null}

                    <Stack direction="row" spacing={1}>
                      <TextField
                        label="Width (px)"
                        type="number"
                        size="small"
                        value={selectedDesk.w}
                        onChange={(e) => handleUpdateSelected('w', Number(e.target.value))}
                      />
                      <TextField
                        label="Height (px)"
                        type="number"
                        size="small"
                        value={selectedDesk.h}
                        onChange={(e) => handleUpdateSelected('h', Number(e.target.value))}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <TextField
                        label="X Pos"
                        type="number"
                        size="small"
                        value={selectedDesk.x}
                        onChange={(e) => handleUpdateSelected('x', Number(e.target.value))}
                      />
                      <TextField
                        label="Y Pos"
                        type="number"
                        size="small"
                        value={selectedDesk.y}
                        onChange={(e) => handleUpdateSelected('y', Number(e.target.value))}
                      />
                    </Stack>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteDesk(selectedIndex)}
                      startIcon={<DeleteOutlineOutlinedIcon />}
                    >
                      Delete Element
                    </Button>
                  </Stack>
                </Paper>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Click any element on the canvas to inspect, rotate, or modify its properties. Or choose an element from the Toolbox to add it.
                </Alert>
              )}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => onSave(desks)} disabled={isSaving}>
          {isSaving ? 'Saving floor layout...' : 'Save Floor Layout'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
