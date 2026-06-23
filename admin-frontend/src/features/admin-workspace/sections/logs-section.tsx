import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import {
  Alert,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import { SectionHeader, LoadingState } from '@/features/admin-workspace/admin-workspace-utils'
import { getWorkspaceAuditLogs } from '@/lib/api'

export const LogsSection = () => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [ipSearch, setIpSearch] = useState('')
  const [page, setPage] = useState(0)

  const PAGE_SIZE = 10

  const logsQuery = useQuery({
    queryKey: ['workspace-audit-logs'],
    queryFn: getWorkspaceAuditLogs,
    refetchInterval: 5000, // Live auto-refresh logs every 5 seconds
  })

  const logs = logsQuery.data ?? []

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !search.trim() ||
        [log.title, log.description].some((val) =>
          val.toLowerCase().includes(search.trim().toLowerCase()),
        )

      const matchesType = typeFilter === 'ALL' || log.type === typeFilter.toLowerCase()

      const matchesIp =
        !ipSearch.trim() ||
        (log.ip_address && log.ip_address.toLowerCase().includes(ipSearch.trim().toLowerCase()))

      return matchesSearch && matchesType && matchesIp
    })
  }, [logs, search, typeFilter, ipSearch])

  // Paginate logs
  const paginatedLogs = useMemo(() => {
    const start = page * PAGE_SIZE
    return filteredLogs.slice(start, start + PAGE_SIZE)
  }, [filteredLogs, page])

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE)

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

  if (logsQuery.isLoading) {
    return <LoadingState />
  }

  if (logsQuery.isError) {
    return <Alert severity="error">Could not load audit logs from the platform.</Alert>
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Audit Logs"
        description="Search, filter, and review all security, user lifecycle, and reservation events recorded on the platform."
      />

      <Paper sx={{ p: 2.25, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Search & Filter Logs</Typography>
            <Chip size="small" label={`${filteredLogs.length} events`} variant="outlined" />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by action or description..."
              size="small"
              fullWidth
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              placeholder="IP Address..."
              size="small"
              value={ipSearch}
              onChange={(e) => {
                setIpSearch(e.target.value)
                setPage(0)
              }}
              sx={{ minWidth: { md: 180 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              label="Event Type"
              size="small"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(0)
              }}
              sx={{ minWidth: { md: 180 } }}
            >
              <MenuItem value="ALL">All types</MenuItem>
              <MenuItem value="USER">User Events</MenuItem>
              <MenuItem value="RESERVATION">Reservations</MenuItem>
              <MenuItem value="ORGANIZATION">Organizations</MenuItem>
              <MenuItem value="PARTNERSHIP">Partnerships</MenuItem>
              <MenuItem value="CONTACT">Contact Requests</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </Paper>

      {filteredLogs.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <HistoryOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="h6">No logs matched your criteria</Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your query or filters to find what you are looking for.
            </Typography>
          </Stack>
        </Paper>
      ) : (
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
              {paginatedLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.type.toUpperCase()}
                      size="small"
                      color={getTypeChipColor(log.type)}
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {log.title}
                  </TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                    {log.ip_address || '127.0.0.1'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {filteredLogs.length > PAGE_SIZE && (
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', alignItems: 'center', mt: 1 }}>
          <Button
            variant="outlined"
            size="small"
            disabled={page === 0}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Prev
          </Button>
          <Typography variant="body2" color="text.secondary">
            Page {page + 1} of {totalPages}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
