import { Box, Paper, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'

import { ChartCard, MetricCard, SectionHeader, StatusChip } from '@/features/admin-workspace/admin-workspace-utils'
import type { AdminWorkspaceResponse } from '@/lib/api-types'

export const DashboardSection = ({
  workspaceData,
}: {
  workspaceData: AdminWorkspaceResponse
}) => (
  <Stack spacing={3}>
    <SectionHeader
      title="Dashboard"
      description="Track performance, supply, demand, and operational activity across the platform."
    />
    <Grid container spacing={2.5}>
      {workspaceData.dashboard.stats.map((stat) => (
        <Grid key={stat.key} size={{ xs: 12, sm: 6, xl: 4 }}>
          <MetricCard label={stat.label} value={stat.value} trend={stat.trend} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, xl: 4 }}>
        <ChartCard title="Reservations by Month" points={workspaceData.dashboard.reservations_by_month} />
      </Grid>
      <Grid size={{ xs: 12, xl: 4 }}>
        <ChartCard title="Most Reserved Places" points={workspaceData.dashboard.most_reserved_places} />
      </Grid>
      <Grid size={{ xs: 12, xl: 4 }}>
        <ChartCard title="Organization Activity" points={workspaceData.dashboard.organization_activity} />
      </Grid>
    </Grid>
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent Activity
      </Typography>
      <Stack spacing={2}>
        {workspaceData.dashboard.recent_activity.map((item) => (
          <Stack
            key={item.id}
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
          >
            <Box>
              <Typography fontWeight={700}>{item.title}</Typography>
              <Typography color="text.secondary">{item.description}</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip value={item.type.toUpperCase()} />
              <Typography variant="body2" color="text.secondary">
                {new Date(item.timestamp).toLocaleString()}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Paper>
  </Stack>
)
