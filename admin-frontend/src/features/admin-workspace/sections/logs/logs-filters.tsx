import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import {
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

type LogsFiltersProps = {
  search: string
  onSearchChange: (value: string) => void
  ipSearch: string
  onIpSearchChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  totalFiltered: number
}

export function LogsFilters({
  search,
  onSearchChange,
  ipSearch,
  onIpSearchChange,
  typeFilter,
  onTypeFilterChange,
  totalFiltered,
}: LogsFiltersProps) {
  return (
    <Paper sx={{ p: 2.25, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Search & Filter Logs</Typography>
          <Chip size="small" label={`${totalFiltered} events`} variant="outlined" />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            placeholder="Search by action or description..."
            size="small"
            fullWidth
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
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
            onChange={(event) => onIpSearchChange(event.target.value)}
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
            onChange={(event) => onTypeFilterChange(event.target.value)}
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
  )
}
