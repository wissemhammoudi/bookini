import { MenuItem, TextField } from '@mui/material'

type RatingFilterSelectProps = {
  label: string
  value: number
  onChange: (value: number) => void
  size?: 'small' | 'medium'
  width?: { xs: string; sm: number }
  marginBottom?: number
}

export function RatingFilterSelect({
  label,
  value,
  onChange,
  size = 'small',
  width = { xs: '100%', sm: 180 },
  marginBottom,
}: RatingFilterSelectProps) {
  return (
    <TextField
      select
      label={label}
      size={size}
      sx={{ width, mb: marginBottom }}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      <MenuItem value={0}>All</MenuItem>
      <MenuItem value={5}>5 stars</MenuItem>
      <MenuItem value={4}>4+ stars</MenuItem>
      <MenuItem value={3}>3+ stars</MenuItem>
      <MenuItem value={2}>2+ stars</MenuItem>
      <MenuItem value={1}>1+ stars</MenuItem>
    </TextField>
  )
}
