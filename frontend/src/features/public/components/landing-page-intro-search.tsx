import {
  Button,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CategoryIcon from '@mui/icons-material/Category'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PeopleIcon from '@mui/icons-material/People'

type LandingPageIntroSearchProps = {
  isLight: boolean
  location: string
  spaceType: string
  date: string
  capacity: string
  onLocationChange: (value: string) => void
  onSpaceTypeChange: (value: string) => void
  onDateChange: (value: string) => void
  onCapacityChange: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
}

export const LandingPageIntroSearch = ({
  isLight,
  location,
  spaceType,
  date,
  capacity,
  onLocationChange,
  onSpaceTypeChange,
  onDateChange,
  onCapacityChange,
  onSubmit,
}: LandingPageIntroSearchProps) => {
  return (
    <Container maxWidth="lg" sx={{ mb: 12 }}>
      <Paper
        elevation={0}
        component="form"
        onSubmit={onSubmit}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: isLight ? '#ffffff' : '#111827',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
          Where would you like to go?
        </Typography>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Location"
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="">Any Location</MenuItem>
              <MenuItem value="Paris">Paris</MenuItem>
              <MenuItem value="Berlin">Berlin</MenuItem>
              <MenuItem value="Tunis">Tunis</MenuItem>
              <MenuItem value="Madrid">Madrid</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Space Type"
              value={spaceType}
              onChange={(event) => onSpaceTypeChange(event.target.value)}
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="">Any Type</MenuItem>
              <MenuItem value="Meeting Rooms">Meeting Rooms</MenuItem>
              <MenuItem value="Coworking Offices">Coworking Offices</MenuItem>
              <MenuItem value="Event Halls">Event Halls</MenuItem>
              <MenuItem value="Sports Fields">Sports Fields</MenuItem>
              <MenuItem value="Training Rooms">Training Rooms</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              variant="outlined"
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              label="Capacity"
              value={capacity}
              onChange={(event) => onCapacityChange(event.target.value)}
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="">Any Capacity</MenuItem>
              <MenuItem value="1-5">1 - 5 People</MenuItem>
              <MenuItem value="6-15">6 - 15 People</MenuItem>
              <MenuItem value="16-50">16 - 50 People</MenuItem>
              <MenuItem value="50+">50+ People</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 1.5 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                py: 1.8,
                fontWeight: 700,
                borderRadius: 2.5,
                minWidth: { md: '120px' },
              }}
            >
              <SearchIcon sx={{ mr: 0.5 }} /> Search
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}
