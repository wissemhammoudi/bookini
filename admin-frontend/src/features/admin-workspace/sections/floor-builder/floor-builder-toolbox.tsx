import { Box, Button, Grid, Paper, Typography } from '@mui/material'

import { TOOLBOX_TEMPLATES, getElementIcon } from '@/features/admin-workspace/sections/floor-builder/floor-layout-visuals'

type FloorBuilderToolboxProps = {
  onAddTemplate: (template: (typeof TOOLBOX_TEMPLATES)[number]) => void
}

export function FloorBuilderToolbox({ onAddTemplate }: FloorBuilderToolboxProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2, backgroundColor: (theme) => `${theme.palette.primary.main}03` }}>
      <Typography sx={{ fontWeight: 800, mb: 2 }}>Toolbox Rooms</Typography>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>
        Standard Rooms
      </Typography>
      <Grid container spacing={1} sx={{ mb: 2.5 }}>
        {TOOLBOX_TEMPLATES.filter((template) => template.category === 'Standard Rooms').map((template) => (
          <Grid key={template.label} size={{ xs: 6 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => onAddTemplate(template)}
              sx={{
                height: 72,
                flexDirection: 'column',
                borderRadius: 2,
                textTransform: 'none',
                p: 1,
                fontSize: '11px',
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {getElementIcon(template.type)}
              <Box sx={{ mt: 0.75 }}>{template.label}</Box>
            </Button>
          </Grid>
        ))}
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>
        Custom Space
      </Typography>
      <Grid container spacing={1}>
        {TOOLBOX_TEMPLATES.filter((template) => template.category === 'Custom Space').map((template) => (
          <Grid key={template.label} size={{ xs: 6 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => onAddTemplate(template)}
              sx={{
                height: 72,
                flexDirection: 'column',
                borderRadius: 2,
                textTransform: 'none',
                p: 1,
                fontSize: '11px',
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {getElementIcon(template.type)}
              <Box sx={{ mt: 0.75 }}>{template.label}</Box>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}
