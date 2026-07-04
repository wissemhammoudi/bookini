import { Box, Paper, Stack, Typography, Chip, alpha } from '@mui/material'
import Grid from '@mui/material/Grid'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import EventSeatOutlinedIcon from '@mui/icons-material/EventSeatOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'

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
    <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', background: alpha('#0059B3', 0.03) }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'center' } }}>
        <Box>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.12em' }}>
            Live Overview
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {workspaceData.role === 'SUPER_ADMIN' ? 'Super Admin Control Center' : 'Organization Admin Workspace'}
          </Typography>
          <Typography color="text.secondary">
            Current operational snapshot with workspace-level metrics and live activity.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip icon={<InsightsOutlinedIcon fontSize="small" />} label={`${workspaceData.dashboard.stats.length} metrics`} variant="outlined" />
          <Chip icon={<EventSeatOutlinedIcon fontSize="small" />} label={`${workspaceData.dashboard.reservations_by_month.length} booking periods`} variant="outlined" />
          <Chip icon={<BusinessOutlinedIcon fontSize="small" />} label={`${workspaceData.dashboard.most_reserved_places.length} top spaces`} variant="outlined" />
        </Stack>
      </Stack>
    </Paper>
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
            sx={{ justifyContent: 'space-between' }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
              <Typography color="text.secondary">{item.description}</Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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
