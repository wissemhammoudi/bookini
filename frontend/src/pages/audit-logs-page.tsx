import { useQuery } from '@tanstack/react-query'
import { Alert, Paper, Stack, Typography } from '@mui/material'

import { listAuditLogs } from '../lib/api'

export const AuditLogsPage = () => {
  const logsQuery = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => listAuditLogs(100),
  })

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Audit logs</Typography>

      {logsQuery.isError ? (
        <Alert severity="error">Super admin access required for audit logs.</Alert>
      ) : null}

      {logsQuery.data?.map((item) => (
        <Paper key={item.id} sx={{ p: 2 }}>
          <Typography variant="subtitle2">{item.action}</Typography>
          <Typography color="text.secondary" variant="body2">
            User: {item.user_id} | IP: {item.ip_address}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {new Date(item.timestamp).toLocaleString()}
          </Typography>
        </Paper>
      ))}
    </Stack>
  )
}
