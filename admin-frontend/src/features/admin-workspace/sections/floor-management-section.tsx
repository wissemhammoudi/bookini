import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Button, Stack, TextField } from '@mui/material'
import Grid from '@mui/material/Grid'

import { workspaceQueryKey } from '@/features/admin-workspace/admin-workspace-config'
import type { FloorActionHandler } from '@/features/admin-workspace/admin-workspace-types'
import { EmptyState, SectionHeader } from '@/features/admin-workspace/admin-workspace-utils'
import { FloorBuilderDialog } from '@/features/admin-workspace/sections/floor-builder/floor-builder-dialog'
import { FloorCard } from '@/features/admin-workspace/sections/floor-card'
import type { DeskZone } from '@/features/admin-workspace/sections/floor-builder/floor-layout-utils'
import { updateWorkspaceFloor } from '@/lib/api'
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
            .filter((desk) => desk.isReservable !== false)
            .map((desk) => ({
              name: desk.name,
              price: desk.price,
              includes: desk.includes,
              is_reservable: desk.isReservable !== false,
              geometry: {
                x: desk.x,
                y: desk.y,
                w: desk.w,
                h: desk.h,
                rotation: desk.rotation,
                type: desk.type,
              },
            })),
          status: builderFloor.status,
        },
      })
      setBuilderFloor(null)
    } catch (error) {
      console.error(error)
      alert('Could not save layout. Please check console.')
    }
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
        <EmptyState title="No floors available" description="Create a floor to demonstrate floor plans and reservation areas." />
      ) : (
        <Grid container spacing={2.5}>
          {floors.map((floor) => {
            const place = places.find((item) => item.id === floor.place_id)
            return (
              <Grid key={floor.id} size={{ xs: 12, lg: 6 }}>
                <FloorCard
                  floor={floor}
                  place={place}
                  onEditFloor={onEditFloor}
                  onDeleteFloor={onDeleteFloor}
                  onBuildFloor={setBuilderFloor}
                />
              </Grid>
            )
          })}
        </Grid>
      )}

      {builderFloor ? (
        <FloorBuilderDialog
          open={Boolean(builderFloor)}
          floor={builderFloor}
          onClose={() => setBuilderFloor(null)}
          onSave={handleSaveLayout}
          isSaving={saveLayoutMutation.isPending}
        />
      ) : null}
    </Stack>
  )
}

export { FloorBuilderDialog } from '@/features/admin-workspace/sections/floor-builder/floor-builder-dialog'
export type { DeskZone } from '@/features/admin-workspace/sections/floor-builder/floor-layout-utils'
