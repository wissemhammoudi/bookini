import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Avatar, Box, Button, Chip, Paper, Stack, TextField, Typography, alpha } from '@mui/material'
import Grid from '@mui/material/Grid'

import type { FloorActionHandler } from '@/features/admin-workspace/admin-workspace-types'
import { EmptyState, SectionHeader, StatusChip } from '@/features/admin-workspace/admin-workspace-utils'
import type { FloorRecord, PlaceRecord } from '@/lib/api-types'

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

            return (
              <Grid key={floor.id} size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.98))' }}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Avatar
                        src={floor.blueprint_image || undefined}
                        variant="rounded"
                        sx={{ width: 96, height: 96, borderRadius: 4 }}
                      />
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
                        <Chip key={area} label={area} variant="outlined" sx={{ backgroundColor: alpha('#0F6FDB', 0.04) }} />
                      ))}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
    </Stack>
  )
}
