import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  Toolbar,
  Typography,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'

import { useColorMode } from '@/app/use-color-mode'
import { ConfirmDialog, FloorDialog, OrganizationDialog, PlaceDialog, SettingsDialog, UserDialog } from '@/features/admin-workspace/admin-dialogs'
import { drawerWidth, sections, workspaceQueryKey } from '@/features/admin-workspace/admin-workspace-config'
import {
  type DialogState,
  type FeedbackState,
  type ReservationFilter,
  type RoleFilter,
  type SectionKey,
} from '@/features/admin-workspace/admin-workspace-types'
import { getErrorMessage } from '@/features/admin-workspace/utils'
import {
  DashboardSection,
  FloorsSection,
  OrganizationsSection,
  PlacesSection,
  RatingsSection,
  RequestsSection,
  ReservationsSection,
  SettingsSection,
  UsersSection,
  LogsSection,
} from '@/features/admin-workspace/sections'
import { useAuth } from '@/features/auth/use-auth'
import {
  createWorkspaceFloor,
  createWorkspaceOrganization,
  createWorkspacePlace,
  createWorkspaceUser,
  deleteWorkspaceContact,
  deleteWorkspaceFloor,
  deleteWorkspaceOrganization,
  deleteWorkspacePlace,
  deleteWorkspaceUser,
  getAdminWorkspace,
  updateWorkspaceContactRequest,
  updateWorkspaceFloor,
  updateWorkspaceOrganization,
  updateWorkspaceOrganizationStatus,
  updateWorkspacePlace,
  updateWorkspaceReservation,
  updateWorkspaceSettings,
  updateWorkspaceUser,
  updateWorkspaceUserStatus,
} from '@/lib/api'
import type { ContactRequestRecord } from '@/lib/api-types'
import { LoadingState } from '@/features/admin-workspace/admin-workspace-utils'

export const AdminWorkspacePage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { mode, toggleMode } = useColorMode()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const queryClient = useQueryClient()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [dialogState, setDialogState] = useState<DialogState>(null)
  const [previewRequest, setPreviewRequest] = useState<ContactRequestRecord | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')
  const [reservationFilter, setReservationFilter] = useState<ReservationFilter>('ALL')
  const brandLogoSrc = '/navbar_logo.png'

  const currentSection = useMemo<SectionKey>(() => {
    const section = location.pathname.split('/')[2] as SectionKey | undefined
    return section ?? 'dashboard'
  }, [location.pathname])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: workspaceQueryKey,
    queryFn: getAdminWorkspace,
  })

  const allowedSections = useMemo(() => {
    if (!data) {
      return []
    }

    return sections.filter((section) => section.roles.includes(data.role))
  }, [data])

  useEffect(() => {
    if (!data) {
      return
    }

    const sectionAllowed = allowedSections.some((section) => section.key === currentSection)
    if (!sectionAllowed) {
      navigate(`/app/${allowedSections[0]?.key ?? 'dashboard'}`, { replace: true })
    }
  }, [allowedSections, currentSection, data, navigate])

  const deferredSearch = useDeferredValue(search.trim().toLowerCase())

  const showSuccess = (message: string) => setFeedback({ severity: 'success', message })
  const showError = (message: string) => setFeedback({ severity: 'error', message })

  const invalidateWorkspace = async () => {
    await queryClient.invalidateQueries({ queryKey: workspaceQueryKey })
  }

  const closeDialog = () => setDialogState(null)

  const actionMutation = useMutation({
    mutationFn: async (callback: () => Promise<unknown>) => callback(),
  })

  const handleMutation = async (callback: () => Promise<unknown>, successMessage: string) => {
    try {
      await actionMutation.mutateAsync(callback)
      await invalidateWorkspace()
      closeDialog()
      showSuccess(successMessage)
    } catch (mutationError) {
      showError(getErrorMessage(mutationError))
      throw mutationError
    }
  }

  const workspace = data?.collections

  const users = useMemo(() => {
    if (!workspace) {
      return []
    }

    return workspace.users.filter((user) => {
      const matchesSearch =
        !deferredSearch
        || [user.full_name, user.email, user.phone].some((value) => value.toLowerCase().includes(deferredSearch))
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [deferredSearch, roleFilter, workspace])

  const organizations = useMemo(() => {
    if (!workspace) {
      return []
    }

    return workspace.organizations.filter((organization) =>
      !deferredSearch
      || [organization.name, organization.contact_email, organization.address].some((value) => value.toLowerCase().includes(deferredSearch)),
    )
  }, [deferredSearch, workspace])

  const places = useMemo(() => {
    if (!workspace) {
      return []
    }

    return workspace.places.filter((place) =>
      !deferredSearch
      || [place.name, place.category, place.address].some((value) => value.toLowerCase().includes(deferredSearch)),
    )
  }, [deferredSearch, workspace])

  const floors = useMemo(() => {
    if (!workspace) {
      return []
    }

    return workspace.floors.filter((floor) =>
      !deferredSearch
      || [floor.floor_name, floor.description].some((value) => value.toLowerCase().includes(deferredSearch)),
    )
  }, [deferredSearch, workspace])

  const reservations = useMemo(() => {
    if (!workspace) {
      return []
    }

    return workspace.reservations.filter((reservation) => {
      const matchesSearch =
        !deferredSearch
        || [reservation.id, reservation.user_name, reservation.place_name, reservation.floor_name]
          .some((value) => value.toLowerCase().includes(deferredSearch))
      const matchesStatus = reservationFilter === 'ALL' || reservation.status === reservationFilter
      return matchesSearch && matchesStatus
    })
  }, [deferredSearch, reservationFilter, workspace])

  const requests = workspace?.contact_requests ?? []

  const openConfirm = (
    title: string,
    description: string,
    confirmLabel: string,
    onConfirm: () => Promise<void>,
    color?: 'error' | 'primary' | 'warning',
  ) => {
    setDialogState({ title, description, confirmLabel, onConfirm, color, type: 'confirm' })
  }

  const sectionConfig = allowedSections.find((section) => section.key === currentSection) ?? allowedSections[0]

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 520 }}>
          <LoadingState />
        </Box>
      </Box>
    )
  }

  if (isError || !data || !workspace || !sectionConfig) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 480, width: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h5">Unable to load the admin workspace</Typography>
            <Alert severity="error">{getErrorMessage(error)}</Alert>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => void refetch()}>Retry</Button>
              <Button variant="outlined" onClick={signOut}>Sign out</Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    )
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, background: mode === 'light' ? 'linear-gradient(180deg, #FFFFFF 0%, #F5F7FB 100%)' : 'linear-gradient(180deg, #101D32 0%, #0C1525 100%)' }}>
      <Stack spacing={1.5} sx={{ px: 1.5, py: 2 }}>
        <Box
          component="img"
          src={brandLogoSrc}
          alt="Bookiblastek"
          sx={{
            height: 34,
            width: 'auto',
            display: 'block',
            mb: 0.5,
          }}
        />
        <Typography variant="overline" color="primary.main">Bookiblastek Platform</Typography>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Admin Console</Typography>
        <Typography color="text.secondary">{sectionConfig.caption}</Typography>
      </Stack>
      <Divider sx={{ my: 1.5 }} />
      <List sx={{ flex: 1, px: 0.5 }}>
        {allowedSections.map((section) => (
          <ListItemButton
            key={section.key}
            selected={section.key === currentSection}
            onClick={() => {
              navigate(`/app/${section.key}`)
              setMobileOpen(false)
            }}
            sx={{ borderRadius: 3, mb: 0.75 }}
          >
            <ListItemIcon>{section.icon}</ListItemIcon>
            <ListItemText primary={section.label} secondary={section.caption} />
          </ListItemButton>
        ))}
      </List>
      <Paper sx={{ p: 2, borderRadius: 4, background: 'linear-gradient(145deg, rgba(0, 89, 179, 0.16), rgba(0, 168, 143, 0.14))' }}>
        <Typography variant="subtitle2">Signed in as</Typography>
        <Typography variant="h6">{workspace.settings.profile.full_name}</Typography>
        <Typography color="text.secondary">{data.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Organization Admin'}</Typography>
      </Paper>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', background: mode === 'light' ? 'linear-gradient(180deg, #F5F7FB 0%, #FFFFFF 100%)' : 'linear-gradient(180deg, #0C1525 0%, #101D32 100%)' }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(12, 21, 37, 0.8)',
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 78, flexWrap: 'wrap', py: 1.25 }}>
          {!isDesktop ? <IconButton onClick={() => setMobileOpen(true)}><MenuOutlinedIcon /></IconButton> : null}
          <Box
            component="img"
            src={brandLogoSrc}
            alt="Bookiblastek"
            sx={{
              height: 30,
              width: 'auto',
              display: 'block',
              mr: { xs: 0, md: 0.5 },
            }}
          />
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 0 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.25, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>{sectionConfig.label}</Typography>
              <Chip size="small" label={data.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Organization Admin'} variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary">{sectionConfig.caption}</Typography>
          </Box>
          <IconButton onClick={toggleMode}>{mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}</IconButton>
          <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800 }}>{workspace.settings.profile.full_name.slice(0, 1)}</Avatar>
          <Button variant="outlined" startIcon={<LogoutOutlinedIcon />} onClick={signOut} sx={{ ml: { xs: 0, sm: 'auto', lg: 0 } }}>Sign out</Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: { xs: '100vw', sm: drawerWidth }, maxWidth: drawerWidth, boxSizing: 'border-box' } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' } }}>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, ml: { lg: `${drawerWidth}px` }, p: { xs: 2, md: 3 }, pt: { xs: 11.5, md: 13 } }}>
        <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', background: mode === 'light' ? 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FB 100%)' : 'linear-gradient(135deg, rgba(16, 29, 50, 0.95) 0%, rgba(12, 21, 37, 0.95) 100%)' }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'center' } }}>
            <Box>
              <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.12em' }}>
                Workspace Overview
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
                {workspace.settings.profile.full_name}
              </Typography>
              <Typography color="text.secondary">
                {data.role === 'SUPER_ADMIN' ? 'Full platform control with organization, place, and request management.' : 'Focused operations across places, floors, reservations, and settings.'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip label={`${workspace.users.length} users`} variant="outlined" />
              <Chip label={`${workspace.organizations.length} organizations`} variant="outlined" />
              <Chip label={`${workspace.reservations.length} reservations`} variant="outlined" />
            </Stack>
          </Stack>
        </Paper>
        {currentSection === 'dashboard' ? <DashboardSection workspaceData={data} /> : null}
        {currentSection === 'users' ? (
          <UsersSection
            users={users}
            organizations={workspace.organizations}
            search={search}
            roleFilter={roleFilter}
            onSearchChange={setSearch}
            onRoleFilterChange={setRoleFilter}
            onCreateUser={() => setDialogState({ type: 'user-create' })}
            onEditUser={(user) => setDialogState({ type: 'user-edit', value: user })}
            onToggleUserStatus={(user) => openConfirm(
              user.status === 'ACTIVE' ? 'Suspend user' : 'Activate user',
              `This will ${user.status === 'ACTIVE' ? 'suspend' : 'activate'} ${user.full_name}.`,
              user.status === 'ACTIVE' ? 'Suspend' : 'Activate',
              () => handleMutation(() => updateWorkspaceUserStatus(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'), 'User status updated'),
              'warning',
            )}
            onDeleteUser={(user) => openConfirm(
              'Delete user',
              'This action permanently removes the user from the admin workspace demo.',
              'Delete user',
              () => handleMutation(() => deleteWorkspaceUser(user.id), 'User deleted'),
              'error',
            )}
          />
        ) : null}
        {currentSection === 'organizations' ? (
          <OrganizationsSection
            organizations={organizations}
            search={search}
            onSearchChange={setSearch}
            onCreateOrganization={() => setDialogState({ type: 'organization-create' })}
            onEditOrganization={(organization) => setDialogState({ type: 'organization-edit', value: organization })}
            onToggleOrganizationStatus={(organization) => openConfirm(
              organization.status === 'ACTIVE' ? 'Suspend organization' : 'Activate organization',
              `This will ${organization.status === 'ACTIVE' ? 'suspend' : 'activate'} ${organization.name}.`,
              organization.status === 'ACTIVE' ? 'Suspend' : 'Activate',
              () => handleMutation(() => updateWorkspaceOrganizationStatus(organization.id, organization.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'), 'Organization status updated'),
            )}
            onDeleteOrganization={(organization) => openConfirm(
              'Delete organization',
              'Deleting an organization also removes related demo users, places, floors, and reservations.',
              'Delete organization',
              () => handleMutation(() => deleteWorkspaceOrganization(organization.id), 'Organization deleted'),
              'error',
            )}
          />
        ) : null}
        {currentSection === 'places' ? (
          <PlacesSection
            places={places}
            search={search}
            onSearchChange={setSearch}
            onCreatePlace={() => setDialogState({ type: 'place-create' })}
            onEditPlace={(place) => setDialogState({ type: 'place-edit', value: place })}
            onDeletePlace={(place) => openConfirm(
              'Delete place',
              'Deleting a place also removes its floors and reservations from the demo dataset.',
              'Delete place',
              () => handleMutation(() => deleteWorkspacePlace(place.id), 'Place deleted'),
              'error',
            )}
            onViewReservations={() => navigate('/app/reservations')}
          />
        ) : null}
        {currentSection === 'floors' ? (
          <FloorsSection
            floors={floors}
            places={workspace.places}
            search={search}
            onSearchChange={setSearch}
            onCreateFloor={() => setDialogState({ type: 'floor-create' })}
            onEditFloor={(floor) => setDialogState({ type: 'floor-edit', value: floor })}
            onDeleteFloor={(floor) => openConfirm(
              'Delete floor',
              'This will remove the selected floor and all reservations tied to it in the demo dataset.',
              'Delete floor',
              () => handleMutation(() => deleteWorkspaceFloor(floor.id), 'Floor deleted'),
              'error',
            )}
          />
        ) : null}
        {currentSection === 'ratings' ? <RatingsSection /> : null}
        {currentSection === 'reservations' ? (
          <ReservationsSection
            reservations={reservations}
            search={search}
            reservationFilter={reservationFilter}
            onSearchChange={setSearch}
            onReservationFilterChange={setReservationFilter}
            onApprove={(reservation) => openConfirm(
              'Approve reservation',
              `Approve reservation ${reservation.id} for ${reservation.user_name}.`,
              'Approve',
              () => handleMutation(() => updateWorkspaceReservation(reservation.id, 'APPROVED'), 'Reservation approved'),
            )}
            onReject={(reservation) => openConfirm(
              'Reject reservation',
              `Reject reservation ${reservation.id}.`,
              'Reject',
              () => handleMutation(() => updateWorkspaceReservation(reservation.id, 'REJECTED'), 'Reservation rejected'),
              'warning',
            )}
            onCancel={(reservation) => openConfirm(
              'Cancel reservation',
              `Cancel reservation ${reservation.id}.`,
              'Cancel reservation',
              () => handleMutation(() => updateWorkspaceReservation(reservation.id, 'CANCELLED'), 'Reservation cancelled'),
              'error',
            )}
          />
        ) : null}
        {currentSection === 'requests' ? (
          <RequestsSection
            contactRequests={requests}
            onPreviewMessage={(request) => setPreviewRequest(request)}
            onMarkProcessed={(request) => openConfirm(
              'Mark as processed',
              `Mark ${request.subject} as processed.`,
              'Mark processed',
              () => handleMutation(() => updateWorkspaceContactRequest(request.id, 'PROCESSED'), 'Contact request updated'),
            )}
            onDeleteContact={(request) => openConfirm(
              'Delete contact request',
              'This removes the request from the demo queue.',
              'Delete request',
              () => handleMutation(() => deleteWorkspaceContact(request.id), 'Contact request deleted'),
              'error',
            )}
          />
        ) : null}
        {currentSection === 'logs' ? <LogsSection /> : null}
        {currentSection === 'settings' ? <SettingsSection settings={workspace.settings} onEditSettings={() => setDialogState({ type: 'settings' })} /> : null}
      </Box>

      {dialogState?.type === 'user-create' ? (
        <UserDialog
          open
          title="Create User"
          organizations={workspace.organizations}
          isSubmitting={actionMutation.isPending}
          onClose={closeDialog}
          onSubmit={async (values) => handleMutation(() => createWorkspaceUser(values), 'User created')}
        />
      ) : null}

      {dialogState?.type === 'user-edit' ? (
        <UserDialog
          open
          title="Edit User"
          value={dialogState.value}
          organizations={workspace.organizations}
          isSubmitting={actionMutation.isPending}
          onClose={closeDialog}
          onSubmit={async (values) => handleMutation(() => updateWorkspaceUser(dialogState.value.id, values), 'User updated')}
        />
      ) : null}

      {dialogState?.type === 'organization-create' ? (
        <OrganizationDialog
          open
          title="Create Organization"
          isSubmitting={actionMutation.isPending}
          onClose={closeDialog}
          onSubmit={async (values) => handleMutation(() => createWorkspaceOrganization(values), 'Organization created')}
        />
      ) : null}

      {dialogState?.type === 'organization-edit' ? (
        <OrganizationDialog
          open
          title="Edit Organization"
          value={dialogState.value}
          isSubmitting={actionMutation.isPending}
          onClose={closeDialog}
          onSubmit={async (values) => handleMutation(() => updateWorkspaceOrganization(dialogState.value.id, values), 'Organization updated')}
        />
      ) : null}

      {dialogState?.type === 'place-create' ? (
        <PlaceDialog
          open
          title="Create Place"
          organizations={workspace.organizations}
          isSubmitting={actionMutation.isPending}
          onClose={closeDialog}
          onSubmit={async (values) => handleMutation(() => createWorkspacePlace(values), 'Place created')}
        />
      ) : null}

      {dialogState?.type === 'place-edit' ? (
        <PlaceDialog
          open
          title="Edit Place"
          value={dialogState.value}
          organizations={workspace.organizations}
          isSubmitting={actionMutation.isPending}
          onClose={closeDialog}
          onSubmit={async (values) => handleMutation(() => updateWorkspacePlace(dialogState.value.id, values), 'Place updated')}
        />
      ) : null}

      {dialogState?.type === 'floor-create' ? (
        <FloorDialog
          open
          title="Create Floor"
          places={workspace.places}
          isSubmitting={actionMutation.isPending}
          onClose={closeDialog}
          onSubmit={async (values) => handleMutation(() => createWorkspaceFloor(values), 'Floor created')}
        />
      ) : null}

      {dialogState?.type === 'floor-edit' ? (
        <FloorDialog
          open
          title="Edit Floor"
          value={dialogState.value}
          places={workspace.places}
          isSubmitting={actionMutation.isPending}
          onClose={closeDialog}
          onSubmit={async (values) => handleMutation(() => updateWorkspaceFloor(dialogState.value.id, values), 'Floor updated')}
        />
      ) : null}

      {dialogState?.type === 'settings' ? (
        <SettingsDialog
          open
          value={workspace.settings}
          isSubmitting={actionMutation.isPending}
          onClose={closeDialog}
          onSubmit={async (values) => handleMutation(() => updateWorkspaceSettings(values), 'Settings updated')}
        />
      ) : null}

      {dialogState?.type === 'confirm' ? (
        <ConfirmDialog
          open
          title={dialogState.title}
          description={dialogState.description}
          confirmLabel={dialogState.confirmLabel}
          color={dialogState.color}
          isSubmitting={actionMutation.isPending}
          onClose={closeDialog}
          onConfirm={dialogState.onConfirm}
        />
      ) : null}

      <Dialog
        open={Boolean(previewRequest)}
        onClose={() => setPreviewRequest(null)}
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
            <Typography variant="overline" color="primary.main" sx={{ letterSpacing: '0.12em', fontWeight: 800 }}>
              Message Preview
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {previewRequest?.subject}
            </Typography>
            <Typography color="text.secondary">
              {previewRequest?.full_name} · {previewRequest?.email}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: mode === 'light' ? 'rgba(0, 89, 179, 0.03)' : 'rgba(66, 165, 245, 0.08)',
            }}
          >
            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>
              {previewRequest?.message}
            </Typography>
          </Paper>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2, justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Phone: {previewRequest?.phone || 'Not provided'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Received {previewRequest ? new Date(previewRequest.date).toLocaleString() : ''}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2.5, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => setPreviewRequest(null)}>
              Close
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar open={Boolean(feedback)} autoHideDuration={3500} onClose={() => setFeedback(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {feedback ? <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>{feedback.message}</Alert> : <span />}
      </Snackbar>
    </Box>
  )
}
