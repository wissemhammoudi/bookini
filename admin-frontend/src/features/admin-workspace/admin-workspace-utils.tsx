import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined'
import { Box, Button, Chip, CircularProgress, Paper, Stack, Typography, alpha } from '@mui/material'

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

export const SectionHeader = ({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) => (
  <Stack
    direction={{ xs: 'column', md: 'row' }}
    spacing={2}
    sx={{
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', md: 'center' },
      pb: 0.5,
    }}
  >
    <Box>
      <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.12em' }}>
        Workspace
      </Typography>
      <Typography variant="h4" sx={{ fontSize: { xs: '1.7rem', md: '2rem' } }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
        {description}
      </Typography>
    </Box>
    {action}
  </Stack>
)

export const StatusChip = ({ value }: { value: string }) => {
  const color =
    value === 'ACTIVE' || value === 'APPROVED' || value === 'PROCESSED'
      ? 'success'
      : value === 'PENDING'
        ? 'warning'
        : 'default'

  return <Chip size="small" label={value.replace('_', ' ')} color={color} sx={{ fontWeight: 700 }} />
}

export const EmptyState = ({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description: string
  action?: React.ReactNode
  icon?: React.ReactNode
}) => (
  <Paper sx={{ p: 5, textAlign: 'center', border: '1px dashed', borderColor: 'divider', background: `linear-gradient(180deg, ${alpha('#0F6FDB', 0.035)} 0%, ${alpha('#1EA88A', 0.03)} 100%)` }}>
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Box sx={{ width: 56, height: 56, display: 'grid', placeItems: 'center', borderRadius: '50%', backgroundColor: alpha('#0F6FDB', 0.12), color: 'primary.main' }}>
        {icon ?? <InboxOutlinedIcon />}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 420, mx: 'auto' }}>
          {description}
        </Typography>
      </Box>
      {action ?? null}
    </Stack>
  </Paper>
)

export const LoadingState = ({
  title = 'Loading workspace',
  description = 'Fetching the latest admin data and workspace context.',
}: {
  title?: string
  description?: string
}) => (
  <Paper
    sx={{
      p: 4,
      border: '1px solid',
      borderColor: 'divider',
      background: `linear-gradient(180deg, ${alpha('#0F6FDB', 0.05)} 0%, ${alpha('#1EA88A', 0.035)} 100%)`,
    }}
  >
    <Stack spacing={2.25} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: alpha('#0F6FDB', 0.12),
        }}
      >
        <CircularProgress size={32} />
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 480 }}>
          {description}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
        <Chip icon={<HourglassBottomOutlinedIcon fontSize="small" />} label="Syncing metrics" variant="outlined" />
        <Chip label="Updating lists" variant="outlined" />
        <Chip label="Preparing workspace" variant="outlined" />
      </Stack>
      <Button variant="outlined" disabled>
        Please wait
      </Button>
    </Stack>
  </Paper>
)

export const ChartCard = ({
  title,
  points,
}: {
  title: string
  points: Array<{ label: string; value: number }>
}) => {
  const max = Math.max(...points.map((point) => point.value), 1)

  return (
    <Paper sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,249,255,0.98))' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-end', minHeight: 180 }}>
        {points.map((point) => (
          <Stack key={point.label} spacing={1} sx={{ flex: 1, alignItems: 'center', minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {point.value}
            </Typography>
            <Box
              sx={{
                width: '100%',
                minHeight: 12,
                height: `${(point.value / max) * 120 + 20}px`,
                borderRadius: 3,
                background: 'linear-gradient(180deg, #0F6FDB 0%, #1EA88A 100%)',
                boxShadow: '0 12px 24px rgba(15, 111, 219, 0.18)',
              }}
            />
            <Typography variant="caption" align="center">
              {point.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  )
}

export const MetricCard = ({
  label,
  value,
  trend,
}: {
  label: string
  value: number
  trend: string
}) => (
  <Paper sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 900 }}>{value}</Typography>
      <Chip size="small" label={trend} sx={{ alignSelf: 'flex-start', fontWeight: 700 }} />
    </Stack>
  </Paper>
)
