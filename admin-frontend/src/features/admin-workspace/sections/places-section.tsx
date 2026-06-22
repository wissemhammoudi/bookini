import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Avatar, Box, Button, Chip, Paper, Stack, TextField, Typography, alpha } from '@mui/material'
import Grid from '@mui/material/Grid'

import type { PlaceActionHandler } from '@/features/admin-workspace/admin-workspace-types'
import { EmptyState, SectionHeader, StatusChip } from '@/features/admin-workspace/admin-workspace-utils'
import type { PlaceRecord } from '@/lib/api-types'

type PlacesSectionProps = {
  places: PlaceRecord[]
  search: string
  onSearchChange: (value: string) => void
  onCreatePlace: () => void
  onEditPlace: PlaceActionHandler
  onDeletePlace: PlaceActionHandler
  onViewReservations: () => void
}

export const PlacesSection = ({
  onCreatePlace,
  onDeletePlace,
  onEditPlace,
  onSearchChange,
  onViewReservations,
  places,
  search,
}: PlacesSectionProps) => (
  <Stack spacing={3}>
    <SectionHeader
      title="Place Management"
      description="Control place metadata, capacity, pricing, media, and reservation-facing features."
      action={<Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={onCreatePlace}>Create Place</Button>}
    />
    <TextField fullWidth placeholder="Search places by name, category, or address" value={search} onChange={(event) => onSearchChange(event.target.value)} />
    {places.length === 0 ? <EmptyState title="No places available" description="Create a place to demonstrate organization inventory and reservation zones." /> : (
      <Grid container spacing={2.5}>
        {places.map((place) => (
          <Grid key={place.id} size={{ xs: 12, xl: 6 }}>
            <Paper sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.98))' }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Avatar src={place.cover_image || undefined} variant="rounded" sx={{ width: 96, height: 96, borderRadius: 4 }} />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">{place.name}</Typography>
                        <Typography color="text.secondary">{place.category}</Typography>
                      </Box>
                      <StatusChip value={place.status} />
                    </Stack>
                    <Typography sx={{ mt: 1 }}>{place.description}</Typography>
                  </Box>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Capacity</Typography><Typography>{place.capacity}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Pricing</Typography><Typography>${place.pricing.toFixed(2)}</Typography></Grid>
                  <Grid size={{ xs: 12 }}><Typography variant="body2" color="text.secondary">Availability</Typography><Typography>{place.availability}</Typography></Grid>
                  <Grid size={{ xs: 12 }}><Typography variant="body2" color="text.secondary">Address</Typography><Typography>{place.address}</Typography></Grid>
                </Grid>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {place.features.map((feature) => <Chip key={feature} label={feature} variant="outlined" sx={{ backgroundColor: alpha('#0059B3', 0.04) }} />)}
                </Stack>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button startIcon={<VisibilityOutlinedIcon />} onClick={onViewReservations}>View Reservations</Button>
                  <Button startIcon={<EditOutlinedIcon />} onClick={() => onEditPlace(place)}>Edit</Button>
                  <Button color="error" startIcon={<DeleteOutlineOutlinedIcon />} onClick={() => onDeletePlace(place)}>Delete</Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    )}
  </Stack>
)
