import RotateRightOutlinedIcon from '@mui/icons-material/RotateRightOutlined'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import type { MouseEvent } from 'react'

import { getElementColors, getElementIcon } from '@/features/admin-workspace/sections/floor-builder/floor-layout-visuals'
import type { DeskZone } from '@/features/admin-workspace/sections/floor-builder/floor-layout-utils'

type FloorBuilderCanvasProps = {
  desks: DeskZone[]
  selectedIndex: number | null
  onSelectDesk: (event: MouseEvent, index: number) => void
  onResizeDesk: (event: MouseEvent, index: number) => void
  onRotateSelected: () => void
}

export function FloorBuilderCanvas({
  desks,
  selectedIndex,
  onSelectDesk,
  onResizeDesk,
  onRotateSelected,
}: FloorBuilderCanvasProps) {
  return (
    <Box
      sx={{
        width: 500,
        height: 500,
        position: 'relative',
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#fcfdfe' : '#0d131f'),
        backgroundImage: (theme) =>
          theme.palette.mode === 'light'
            ? 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)'
            : 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        mx: 'auto',
        overflow: 'hidden',
      }}
    >
      {desks.map((desk, idx) => {
        const isSelected = selectedIndex === idx
        const type = desk.type || 'desk'
        const rotation = desk.rotation || 0
        const colors = getElementColors(type, isSelected)

        return (
          <Box
            key={idx}
            onMouseDown={(event) => onSelectDesk(event, idx)}
            sx={{
              position: 'absolute',
              left: desk.x,
              top: desk.y,
              width: desk.w,
              height: desk.h,
              backgroundColor: colors.bg,
              border: '2px solid',
              borderColor: colors.border,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'move',
              boxShadow: colors.shadow,
              userSelect: 'none',
              p: 0.5,
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.15s ease-in-out',
            }}
          >
            {isSelected ? (
              <IconButton
                size="small"
                onMouseDown={(event) => {
                  event.stopPropagation()
                  event.preventDefault()
                  onRotateSelected()
                }}
                sx={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  width: 20,
                  height: 20,
                  zIndex: 10,
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                <RotateRightOutlinedIcon sx={{ fontSize: '11px' }} />
              </IconButton>
            ) : null}

            <Stack spacing={0.5} sx={{ alignItems: 'center', pointerEvents: 'none', width: '100%' }}>
              {getElementIcon(type)}
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, textAlign: 'center', fontSize: '9px', wordBreak: 'break-all', display: desk.w > 40 ? 'block' : 'none' }}
              >
                {desk.name}
              </Typography>
            </Stack>

            <Box
              onMouseDown={(event) => onResizeDesk(event, idx)}
              sx={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 14,
                height: 14,
                cursor: 'se-resize',
                backgroundColor: colors.accent,
                borderTopLeftRadius: 4,
                borderBottomRightRadius: 2,
              }}
            />
          </Box>
        )
      })}
    </Box>
  )
}
