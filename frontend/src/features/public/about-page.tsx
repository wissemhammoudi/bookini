import { Stack, Typography, Box, Paper, alpha } from '@mui/material'
import { useColorMode } from '@/app/use-color-mode'

/**
 * About Page
 * Displays company mission, vision, and values
 */
export const AboutPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isLight
          ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #eef2ff 100%)'
          : 'linear-gradient(180deg, #0a0e1a 0%, #101d32 45%, #1a1f3a 100%)',
      }}
    >
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={1.5} sx={{ mb: 3, maxWidth: 760, mx: 'auto', px: { xs: 2, md: 0 } }}>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>
            Company overview
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            About bookiwa7dek
          </Typography>
          <Typography color="text.secondary" variant="h6">
            We're revolutionizing workspace booking with a simple, reliable platform for modern teams.
          </Typography>
        </Stack>

        <Box
          sx={{
            mt: 6,
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2, md: 0 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 3,
          }}
        >
          {[
            {
              title: 'Our Mission',
              description: 'Empower organizations to manage their workspace efficiently with seamless booking and real-time availability.',
            },
            {
              title: 'Our Vision',
              description: 'Create a world where workspace management is intuitive, transparent, and accessible to every organization.',
            },
            {
              title: 'Our Values',
              description: 'We prioritize simplicity, reliability, and customer success in everything we do.',
            },
          ].map((item, idx) => (
            <Box key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
