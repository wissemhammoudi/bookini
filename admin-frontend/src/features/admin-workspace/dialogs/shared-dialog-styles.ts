import { alpha } from '@mui/material'
import type { Theme } from '@mui/material'

export const dialogPaperSx = {
  '& .MuiDialog-paper': {
    borderRadius: 5,
    border: '1px solid',
    borderColor: 'divider',
    backgroundImage: 'none',
    background: (theme: Theme) =>
      theme.palette.mode === 'light'
        ? 'linear-gradient(180deg, #FFFFFF 0%, #F7FAFF 100%)'
        : 'linear-gradient(180deg, #101D32 0%, #0C1525 100%)',
    boxShadow: '0 28px 70px rgba(16, 24, 40, 0.16)',
  },
}

export const dialogContentSx = {
  pt: 2.5,
}

export const dialogActionsSx = {
  px: 3,
  py: 2.5,
  borderTop: '1px solid',
  borderColor: 'divider',
  backgroundColor: alpha('#0059B3', 0.02),
}
