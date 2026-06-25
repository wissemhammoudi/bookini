import {
  alpha,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material'

import type { IntroCategory } from './landing-page-intro-data'

type LandingPageIntroCategoriesProps = {
  isLight: boolean
  categories: IntroCategory[]
  navigate: (path: string) => void
}

export const LandingPageIntroCategories = ({
  isLight,
  categories,
  navigate,
}: LandingPageIntroCategoriesProps) => {
  return (
    <Container maxWidth="lg" sx={{ mb: 12 }}>
      <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
          Popular Categories
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 900 }}>
          Find the Perfect Setting
        </Typography>
      </Stack>
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category.title}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
                transition: 'all 0.25s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'text.primary',
                },
              }}
              onClick={() => navigate(`/book?type=${encodeURIComponent(category.title)}`)}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ mb: 2 }}>{category.icon}</Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  {category.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {category.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
