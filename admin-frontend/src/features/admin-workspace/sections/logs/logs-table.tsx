import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import {
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import type { AuditLogRecord } from '@/features/admin-workspace/sections/logs/use-logs-section-state'

type LogsTableProps = {
  logs: AuditLogRecord[]
}

const getTypeChipColor = (type: string) => {
  switch (type) {
    case 'user':
      return 'primary'
    case 'reservation':
      return 'success'
    case 'organization':
      return 'warning'
    case 'partnership':
      return 'secondary'
    case 'contact':
      return 'info'
    default:
      return 'default'
  }
}

export function LogsTable({ logs }: LogsTableProps) {
  if (logs.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <HistoryOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
          <Typography variant="h6">No logs matched your criteria</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your query or filters to find what you are looking for.
          </Typography>
        </Stack>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} hover>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
              <TableCell>
                <Chip
                  label={log.type.toUpperCase()}
                  size="small"
                  color={getTypeChipColor(log.type)}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{log.title}</TableCell>
              <TableCell>{log.description}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                {log.ip_address || '127.0.0.1'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
