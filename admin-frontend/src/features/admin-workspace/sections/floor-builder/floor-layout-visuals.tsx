import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import { alpha } from '@mui/material'
import type { Theme } from '@mui/material'

export const TOOLBOX_TEMPLATES = [
  { type: 'table', label: 'Meeting Room', w: 140, h: 80, isReservable: true, category: 'Standard Rooms' },
  { type: 'table', label: 'Conference Room', w: 180, h: 100, isReservable: true, category: 'Standard Rooms' },
  { type: 'desk', label: 'Private Office', w: 100, h: 80, isReservable: true, category: 'Standard Rooms' },
  { type: 'desk', label: 'Focus Room', w: 80, h: 70, isReservable: true, category: 'Standard Rooms' },
  { type: 'table', label: 'Creative Studio', w: 150, h: 90, isReservable: true, category: 'Standard Rooms' },
  { type: 'table', label: 'Training Room', w: 160, h: 100, isReservable: true, category: 'Standard Rooms' },
  { type: 'desk', label: 'Custom Room', w: 100, h: 80, isReservable: true, category: 'Custom Space' },
] as const

export const getElementIcon = (_type: string, size: 'small' | 'medium' = 'medium') => {
  const sx = { fontSize: size === 'small' ? '12px' : '20px' }
  return <MeetingRoomOutlinedIcon sx={sx} />
}

export const getElementColors = (type: string, isSelected: boolean) => {
  if (isSelected) {
    return {
      border: 'primary.main',
      bg: (theme: Theme) => alpha(theme.palette.primary.main, 0.15),
      shadow: '0 0 10px rgba(0, 89, 179, 0.4)',
      accent: 'primary.main',
    }
  }

  switch (type) {
    case 'table':
      return {
        border: 'info.main',
        bg: (theme: Theme) => alpha(theme.palette.info.main, 0.08),
        shadow: 'none',
        accent: 'info.main',
      }
    case 'desk':
    default:
      return {
        border: '#00A88F',
        bg: () => alpha('#00A88F', 0.08),
        shadow: 'none',
        accent: '#00A88F',
      }
  }
}
