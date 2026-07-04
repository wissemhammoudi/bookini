import { Alert, Button, Dialog, DialogContent, DialogTitle, Paper, Snackbar, Stack, Typography } from '@mui/material'

import { ConfirmDialog, FloorDialog, OrganizationDialog, PlaceDialog, SettingsDialog, UserDialog } from '@/features/admin-workspace/admin-dialogs'
import type { DialogState, FeedbackState } from '@/features/admin-workspace/admin-workspace-types'
import {
  createWorkspaceFloor,
  createWorkspaceOrganization,
  createWorkspacePlace,
  createWorkspaceUser,
  updateWorkspaceFloor,
  updateWorkspaceOrganization,
  updateWorkspacePlace,
  updateWorkspaceSettings,
  updateWorkspaceUser,
} from '@/lib/api'
import type { AdminWorkspaceResponse, ContactRequestRecord } from '@/lib/api-types'

type MutationHandler = (callback: () => Promise<unknown>, successMessage: string) => Promise<void>

type AdminWorkspacePageDialogsProps = {
  mode: 'light' | 'dark'
  workspace: AdminWorkspaceResponse['collections']
  dialogState: DialogState
  actionPending: boolean
  previewRequest: ContactRequestRecord | null
  feedback: FeedbackState | null
  onCloseDialog: () => void
  onHandleMutation: MutationHandler
  onSetPreviewRequest: (value: ContactRequestRecord | null) => void
  onSetFeedback: (value: FeedbackState | null) => void
}

export const AdminWorkspacePageDialogs = ({
  mode,
  workspace,
  dialogState,
  actionPending,
  previewRequest,
  feedback,
  onCloseDialog,
  onHandleMutation,
  onSetPreviewRequest,
  onSetFeedback,
}: AdminWorkspacePageDialogsProps) => (
  <>
    {dialogState?.type === 'user-create' ? (
      <UserDialog
        open
        title="Create User"
        organizations={workspace.organizations}
        isSubmitting={actionPending}
        onClose={onCloseDialog}
        onSubmit={async (values) => onHandleMutation(() => createWorkspaceUser(values), 'User created')}
      />
    ) : null}

    {dialogState?.type === 'user-edit' ? (
      <UserDialog
        open
        title="Edit User"
        value={dialogState.value}
        organizations={workspace.organizations}
        isSubmitting={actionPending}
        onClose={onCloseDialog}
        onSubmit={async (values) => onHandleMutation(() => updateWorkspaceUser(dialogState.value.id, values), 'User updated')}
      />
    ) : null}

    {dialogState?.type === 'organization-create' ? (
      <OrganizationDialog
        open
        title="Create Organization"
        isSubmitting={actionPending}
        onClose={onCloseDialog}
        onSubmit={async (values) => onHandleMutation(() => createWorkspaceOrganization(values), 'Organization created')}
      />
    ) : null}

    {dialogState?.type === 'organization-edit' ? (
      <OrganizationDialog
        open
        title="Edit Organization"
        value={dialogState.value}
        isSubmitting={actionPending}
        onClose={onCloseDialog}
        onSubmit={async (values) => onHandleMutation(() => updateWorkspaceOrganization(dialogState.value.id, values), 'Organization updated')}
      />
    ) : null}

    {dialogState?.type === 'place-create' ? (
      <PlaceDialog
        open
        title="Create Place"
        organizations={workspace.organizations}
        isSubmitting={actionPending}
        onClose={onCloseDialog}
        onSubmit={async (values) => onHandleMutation(() => createWorkspacePlace(values), 'Place created')}
      />
    ) : null}

    {dialogState?.type === 'place-edit' ? (
      <PlaceDialog
        open
        title="Edit Place"
        value={dialogState.value}
        organizations={workspace.organizations}
        isSubmitting={actionPending}
        onClose={onCloseDialog}
        onSubmit={async (values) => onHandleMutation(() => updateWorkspacePlace(dialogState.value.id, values), 'Place updated')}
      />
    ) : null}

    {dialogState?.type === 'floor-create' ? (
      <FloorDialog
        open
        title="Create Floor"
        places={workspace.places}
        isSubmitting={actionPending}
        onClose={onCloseDialog}
        onSubmit={async (values) => onHandleMutation(() => createWorkspaceFloor(values), 'Floor created')}
      />
    ) : null}

    {dialogState?.type === 'floor-edit' ? (
      <FloorDialog
        open
        title="Edit Floor"
        value={dialogState.value}
        places={workspace.places}
        isSubmitting={actionPending}
        onClose={onCloseDialog}
        onSubmit={async (values) => onHandleMutation(() => updateWorkspaceFloor(dialogState.value.id, values), 'Floor updated')}
      />
    ) : null}

    {dialogState?.type === 'settings' ? (
      <SettingsDialog
        open
        value={workspace.settings}
        isSubmitting={actionPending}
        onClose={onCloseDialog}
        onSubmit={async (values) => onHandleMutation(() => updateWorkspaceSettings(values), 'Settings updated')}
      />
    ) : null}

    {dialogState?.type === 'confirm' ? (
      <ConfirmDialog
        open
        title={dialogState.title}
        description={dialogState.description}
        confirmLabel={dialogState.confirmLabel}
        color={dialogState.color}
        isSubmitting={actionPending}
        onClose={onCloseDialog}
        onConfirm={dialogState.onConfirm}
      />
    ) : null}

    <Dialog
      open={Boolean(previewRequest)}
      onClose={() => onSetPreviewRequest(null)}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: mode === 'light'
            ? 'linear-gradient(180deg, #FFFFFF 0%, #F7FAFF 100%)'
            : 'linear-gradient(180deg, #101D32 0%, #0C1525 100%)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.25 }}>
        <Stack spacing={0.75}>
          <Typography variant="overline" color="primary.main" sx={{ letterSpacing: '0.12em', fontWeight: 800 }}>Message Preview</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>{previewRequest?.subject}</Typography>
          <Typography color="text.secondary">{previewRequest?.full_name} · {previewRequest?.email}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, backgroundColor: mode === 'light' ? 'rgba(0, 89, 179, 0.03)' : 'rgba(66, 165, 245, 0.08)' }}>
          <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>{previewRequest?.message}</Typography>
        </Paper>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2, justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">Phone: {previewRequest?.phone || 'Not provided'}</Typography>
          <Typography variant="body2" color="text.secondary">Received {previewRequest ? new Date(previewRequest.date).toLocaleString() : ''}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 2.5, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => onSetPreviewRequest(null)}>Close</Button>
        </Stack>
      </DialogContent>
    </Dialog>

    <Snackbar open={Boolean(feedback)} autoHideDuration={3500} onClose={() => onSetFeedback(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      {feedback ? <Alert severity={feedback.severity} onClose={() => onSetFeedback(null)}>{feedback.message}</Alert> : <span />}
    </Snackbar>
  </>
)
