import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
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
} from '@mui/material'
import Grid from '@mui/material/Grid'

import type { FloorActionHandler } from '@/features/admin-workspace/admin-workspace-types'
import { EmptyState, SectionHeader, StatusChip } from '@/features/admin-workspace/admin-workspace-utils'
import type { FloorRecord, PlaceRecord } from '@/lib/api-types'
import { updateWorkspaceFloor } from '@/lib/api'
import { workspaceQueryKey } from '@/features/admin-workspace/admin-workspace-config'

type DeskZone = { name: string; x: number; y: number; w: number; h: number }

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
    mutationFn: (payload: { id: string; data: any }) => updateWorkspaceFloor(payload.id, payload.data),
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
          capacity: builderFloor.capacity,
          description: builderFloor.description,
          blueprint_image: JSON.stringify(desks),
          reservation_areas: desks.map((d) => d.name),
          status: builderFloor.status,
        },
      })
      setBuilderFloor(null)
    } catch (e) {
      console.error(e)
      alert('Could not save layout. Please check console.')
    }
  }

  const renderBlueprintPreview = (blueprintImage: string) => {
    try {
      if (blueprintImage.startsWith('[{"name":')) {
        const layoutDesks = JSON.parse(blueprintImage) as DeskZone[]
        return (
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
              return (
                <Box
                  key={index}
                  sx={{
                    position: 'absolute',
                    left: d.x * scale,
                    top: d.y * scale,
                    width: d.w * scale,
                    height: d.h * scale,
                    backgroundColor: alpha('#00A88F', 0.06),
                    border: '1px solid',
                    borderColor: 'success.main',
                    borderRadius: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '5px', fontWeight: 900, textAlign: 'center', lineHeight: 1 }}>
                    {d.name.substring(0, 3)}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        )
      }
    } catch {
      // ignore
    }
    return null
  }

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
            let parsedLayout: DeskZone[] | null = null
            if (floor.blueprint_image) {
              try {
                if (floor.blueprint_image.startsWith('[{"name":')) {
                  parsedLayout = JSON.parse(floor.blueprint_image)
                }
              } catch {
                // ignore
              }
            }

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
                        renderBlueprintPreview(floor.blueprint_image!)
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
                    <Typography variant="body2">Capacity: {floor.capacity}</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {floor.reservation_areas.map((area) => (
                        <Chip
                          key={area}
                          label={area}
                          variant="outlined"
                          sx={{ backgroundColor: alpha('#0059B3', 0.04) }}
                        />
                      ))}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <Button startIcon={<GridOnOutlinedIcon />} onClick={() => setBuilderFloor(floor)}>
                        Floor Builder
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
  const [desks, setDesks] = useState<DeskZone[]>(() => {
    if (floor.blueprint_image) {
      try {
        if (floor.blueprint_image.startsWith('[{"name":')) {
          return JSON.parse(floor.blueprint_image)
        }
      } catch {
        // ignore
      }
    }
    return (floor.reservation_areas ?? []).map((area, idx) => ({
      name: area,
      x: 20 + (idx % 4) * 110,
      y: 20 + Math.floor(idx / 4) * 80,
      w: 90,
      h: 60,
    }))
  })

  const [newDeskName, setNewDeskName] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const selectedDesk = selectedIndex !== null ? desks[selectedIndex] : null

  const handleAddDesk = () => {
    const name = newDeskName.trim()
    if (!name) return
    if (desks.some((d) => d.name.toLowerCase() === name.toLowerCase())) {
      alert('A zone with this name already exists.')
      return
    }

    const newDesk: DeskZone = {
      name,
      x: 150,
      y: 150,
      w: 90,
      h: 60,
    }

    setDesks((prev) => [...prev, newDesk])
    setNewDeskName('')
    setSelectedIndex(desks.length)
  }

  const handleDeleteDesk = (index: number) => {
    setDesks((prev) => prev.filter((_, i) => i !== index))
    setSelectedIndex(null)
  }

  const handleUpdateSelected = (field: keyof DeskZone, val: any) => {
    if (selectedIndex === null) return
    setDesks((prev) => {
      const updated = [...prev]
      updated[selectedIndex] = { ...updated[selectedIndex], [field]: val }
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
        const nextW = Math.max(40, Math.min(500 - desk.x, Math.round((originalW + dx) / 10) * 10))
        const nextH = Math.max(40, Math.min(500 - desk.y, Math.round((originalH + dy) / 10) * 10))
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          2D Floor Layout Builder — {floor.floor_name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
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
                      backgroundColor: isSelected ? alpha('#0059B3', 0.15) : alpha('#00A88F', 0.08),
                      border: '2px solid',
                      borderColor: isSelected ? 'primary.main' : 'success.main',
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'move',
                      boxShadow: isSelected ? '0 0 10px rgba(0, 89, 179, 0.4)' : 'none',
                      userSelect: 'none',
                      p: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, textAlign: 'center', wordBreak: 'break-all' }}
                    >
                      {desk.name}
                    </Typography>

                    <Box
                      onMouseDown={(e) => handleResizeMouseDown(e, idx)}
                      sx={{
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        width: 14,
                        height: 14,
                        cursor: 'se-resize',
                        backgroundColor: isSelected ? 'primary.main' : 'success.main',
                        borderTopLeftRadius: 4,
                        borderBottomRightRadius: 2,
                      }}
                    />
                  </Box>
                )
              })}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2.5}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1 }}>Add New Zone</Typography>
                <Stack spacing={1.5}>
                  <TextField
                    placeholder="e.g. Desk B4, Zone 1"
                    size="small"
                    value={newDeskName}
                    onChange={(e) => setNewDeskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddDesk()
                    }}
                  />
                  <Button variant="contained" size="small" onClick={handleAddDesk} startIcon={<AddOutlinedIcon />}>
                    Add Zone
                  </Button>
                </Stack>
              </Paper>

              {selectedDesk && selectedIndex !== null ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2, borderColor: 'primary.main', border: '1.5px solid' }}
                >
                  <Typography sx={{ fontWeight: 800, mb: 1.5 }} color="primary">
                    Zone Properties
                  </Typography>
                  <Stack spacing={1.5}>
                    <TextField
                      label="Zone Name"
                      size="small"
                      value={selectedDesk.name}
                      onChange={(e) => handleUpdateSelected('name', e.target.value)}
                    />
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
                      Delete Zone
                    </Button>
                  </Stack>
                </Paper>
              ) : (
                <Alert severity="info">Click any zone on the canvas to inspect or adjust its coordinates.</Alert>
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
          {isSaving ? 'Saving Blueprint...' : 'Save Blueprint'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

