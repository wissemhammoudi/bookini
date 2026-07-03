import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StarIcon from '@mui/icons-material/Star'

import type { SubscriptionPlan } from '../types'

interface PlanCardProps {
  plan: SubscriptionPlan
  isSelected: boolean
  onSelect: (planId: string) => void
  isLight: boolean
}

export const PlanCard = ({ plan, isSelected, onSelect, isLight }: PlanCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '2px solid',
        borderColor: isSelected ? 'primary.main' : isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
        transition: 'all 0.2s',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-4px)',
        },
      }}
      onClick={() => onSelect(plan.id)}
    >
      {plan.recommended && (
        <Chip
          icon={<StarIcon />}
          label="Recommended"
          color="primary"
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12 }}
        />
      )}

      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {plan.name}
          </Typography>

          <Box>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {plan.price} TND
              </Typography>
              <Typography color="text.secondary">{plan.period}</Typography>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)' }} />

          <Stack spacing={1}>
            {plan.features.map((feature, idx) => (
              <Stack key={idx} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: '1rem', color: 'primary.main', flexShrink: 0 }} />
                <Typography variant="body2">{feature}</Typography>
              </Stack>
            ))}
          </Stack>

          <Button
            variant={isSelected ? 'contained' : 'outlined'}
            fullWidth
            sx={{ fontWeight: 700, mt: 1 }}
          >
            {isSelected ? 'Selected' : 'Select Plan'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

import { Box } from '@mui/material'
