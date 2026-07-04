import { Button, Stack, Typography } from '@mui/material'

type LogsPaginationProps = {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

export function LogsPagination({ page, totalPages, onPrev, onNext }: LogsPaginationProps) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', alignItems: 'center', mt: 1 }}>
      <Button variant="outlined" size="small" disabled={page === 0} onClick={onPrev}>
        Prev
      </Button>
      <Typography variant="body2" color="text.secondary">
        Page {page + 1} of {totalPages}
      </Typography>
      <Button variant="outlined" size="small" disabled={page + 1 >= totalPages} onClick={onNext}>
        Next
      </Button>
    </Stack>
  )
}
