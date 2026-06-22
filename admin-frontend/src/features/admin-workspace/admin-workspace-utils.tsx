import { Box, Chip, Paper, Stack, Typography } from '@mui/material'

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
    justifyContent="space-between"
    alignItems={{ xs: 'flex-start', md: 'center' }}
  >
    <Box>
      <Typography variant="h4" sx={{ fontSize: { xs: '1.7rem', md: '2rem' } }}>
        {title}
      </Typography>
      <Typography color="text.secondary">{description}</Typography>
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

  return <Chip size="small" label={value.replace('_', ' ')} color={color} />
}

export const EmptyState = ({
  title,
  description,
}: {
  title: string
  description: string
}) => (
  <Paper sx={{ p: 5, textAlign: 'center' }}>
    <Typography variant="h6">{title}</Typography>
    <Typography color="text.secondary" sx={{ mt: 1 }}>
      {description}
    </Typography>
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
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="flex-end" sx={{ minHeight: 180 }}>
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
                background: 'linear-gradient(180deg, #1171d8 0%, #39b3a2 100%)',
                boxShadow: '0 12px 24px rgba(17, 113, 216, 0.18)',
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
  <Paper sx={{ p: 3, height: '100%' }}>
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4">{value}</Typography>
      <Chip size="small" label={trend} sx={{ alignSelf: 'flex-start' }} />
    </Stack>
  </Paper>
)
