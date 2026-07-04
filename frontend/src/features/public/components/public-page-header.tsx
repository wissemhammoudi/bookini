import { Box, Container, Grid, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface PublicPageHeaderProps {
  isLight: boolean
  eyebrow: string
  title: ReactNode | string
  description: string
  rightElement?: ReactNode
  children?: ReactNode
}

export const PublicPageHeader = ({
  isLight,
  eyebrow,
  title,
  description,
  rightElement,
  children,
}: PublicPageHeaderProps) => {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid',
        borderColor: isLight ? 'rgba(0, 89, 179, 0.05)' : 'rgba(255, 255, 255, 0.04)',
        background: isLight
          ? 'linear-gradient(180deg, rgba(246, 249, 253, 0.9) 0%, rgba(255, 255, 255, 0.5) 100%)'
          : 'linear-gradient(180deg, rgba(11, 15, 25, 0.9) 0%, rgba(15, 23, 42, 0.4) 100%)',
        // Ambient background glows
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          right: '10%',
          width: { xs: 250, md: 450 },
          height: { xs: 250, md: 450 },
          borderRadius: '50%',
          background: isLight
            ? 'radial-gradient(circle, rgba(0, 89, 179, 0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(17, 113, 216, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10%',
          left: '5%',
          width: { xs: 200, md: 350 },
          height: { xs: 200, md: 350 },
          borderRadius: '50%',
          background: isLight
            ? 'radial-gradient(circle, rgba(0, 168, 143, 0.04) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0, 168, 143, 0.06) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: rightElement ? 6 : 12 }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: isLight ? 'primary.main' : 'primary.light',
                    textTransform: 'uppercase',
                    fontSize: '0.78rem',
                    background: isLight
                      ? 'rgba(0, 89, 179, 0.06)'
                      : 'rgba(17, 113, 216, 0.12)',
                    px: 2,
                    py: 0.75,
                    borderRadius: 5,
                    display: 'inline-block',
                  }}
                >
                  {eyebrow}
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 950,
                  letterSpacing: '-0.04em',
                  fontSize: { xs: '2.5rem', sm: '3.25rem', md: '3.75rem' },
                  lineHeight: 1.12,
                  color: 'text.primary',
                }}
              >
                {title}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: '1.125rem',
                  lineHeight: 1.7,
                  maxWidth: rightElement ? '100%' : 780,
                  fontWeight: 450,
                }}
              >
                {description}
              </Typography>

              {children && (
                <Box sx={{ pt: 1 }}>
                  {children}
                </Box>
              )}
            </Stack>
          </Grid>

          {rightElement && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {rightElement}
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  )
}
