import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'

import { useColorMode } from '@/app/use-color-mode'
import { workspaceQueryKey, sections } from '@/features/admin-workspace/admin-workspace-config'
import { AdminWorkspacePageDialogs } from '@/features/admin-workspace/admin-workspace-page-dialogs'
import { AdminWorkspaceSectionsRenderer } from '@/features/admin-workspace/admin-workspace-sections-renderer'
import { AdminWorkspaceShell } from '@/features/admin-workspace/admin-workspace-shell'
import { LoadingState } from '@/features/admin-workspace/admin-workspace-utils'
import type { DialogState, FeedbackState, ReservationFilter, RoleFilter, SectionKey } from '@/features/admin-workspace/admin-workspace-types'
import { getErrorMessage } from '@/features/admin-workspace/utils'
import { getAdminWorkspace } from '@/lib/api'
import type { ContactRequestRecord } from '@/lib/api-types'
import { useAuth } from '@/features/auth/use-auth'

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

  const currentSection = useMemo<SectionKey>(() => (location.pathname.split('/')[2] as SectionKey | undefined) ?? 'dashboard', [location.pathname])
  const deferredSearch = useDeferredValue(search.trim().toLowerCase())

  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: workspaceQueryKey, queryFn: getAdminWorkspace })
  const allowedSections = useMemo(() => (data ? sections.filter((section) => section.roles.includes(data.role)) : []), [data])

  useEffect(() => {
    if (!data) return
    const sectionAllowed = allowedSections.some((section) => section.key === currentSection)
    if (!sectionAllowed) navigate(`/app/${allowedSections[0]?.key ?? 'dashboard'}`, { replace: true })
  }, [allowedSections, currentSection, data, navigate])

  const actionMutation = useMutation({ mutationFn: async (callback: () => Promise<unknown>) => callback() })

  const handleMutation = async (callback: () => Promise<unknown>, successMessage: string) => {
    try {
      await actionMutation.mutateAsync(callback)
      await queryClient.invalidateQueries({ queryKey: workspaceQueryKey })
      setDialogState(null)
      setFeedback({ severity: 'success', message: successMessage })
    } catch (mutationError) {
      setFeedback({ severity: 'error', message: getErrorMessage(mutationError) })
      throw mutationError
    }
  }

  const openConfirm = (
    title: string,
    description: string,
    confirmLabel: string,
    onConfirm: () => Promise<void>,
    color?: 'error' | 'primary' | 'warning',
  ) => setDialogState({ title, description, confirmLabel, onConfirm, color, type: 'confirm' })

  const workspace = data?.collections
  const sectionConfig = allowedSections.find((section) => section.key === currentSection) ?? allowedSections[0]

  const users = useMemo(() => workspace?.users.filter((user) => {
    const matchesSearch = !deferredSearch || [user.full_name, user.email, user.phone].some((value) => value.toLowerCase().includes(deferredSearch))
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    return matchesSearch && matchesRole
  }) ?? [], [deferredSearch, roleFilter, workspace])

  const organizations = useMemo(() => workspace?.organizations.filter((organization) => !deferredSearch || [organization.name, organization.contact_email, organization.address].some((value) => value.toLowerCase().includes(deferredSearch))) ?? [], [deferredSearch, workspace])
  const places = useMemo(() => workspace?.places.filter((place) => !deferredSearch || [place.name, place.category, place.address].some((value) => value.toLowerCase().includes(deferredSearch))) ?? [], [deferredSearch, workspace])
  const floors = useMemo(() => workspace?.floors.filter((floor) => !deferredSearch || [floor.floor_name, floor.description].some((value) => value.toLowerCase().includes(deferredSearch))) ?? [], [deferredSearch, workspace])

  const reservations = useMemo(() => workspace?.reservations.filter((reservation) => {
    const matchesSearch = !deferredSearch || [reservation.id, reservation.user_name, reservation.place_name, reservation.floor_name].some((value) => value.toLowerCase().includes(deferredSearch))
    const matchesStatus = reservationFilter === 'ALL' || reservation.status === reservationFilter
    return matchesSearch && matchesStatus
  }) ?? [], [deferredSearch, reservationFilter, workspace])

  const requests = workspace?.contact_requests ?? []

  if (isLoading) {
    return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}><Box sx={{ width: '100%', maxWidth: 520 }}><LoadingState /></Box></Box>
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

  return (
    <>
      <AdminWorkspaceShell
        mode={mode}
        isDesktop={isDesktop}
        mobileOpen={mobileOpen}
        brandLogoSrc="/navbar_logo.png"
        role={data.role}
        workspaceName={workspace.settings.profile.full_name}
        sectionConfig={sectionConfig}
        allowedSections={allowedSections}
        currentSection={currentSection}
        counts={{ users: workspace.users.length, organizations: workspace.organizations.length, reservations: workspace.reservations.length }}
        onToggleMode={toggleMode}
        onSignOut={signOut}
        onOpenMobileMenu={() => setMobileOpen(true)}
        onCloseMobileMenu={() => setMobileOpen(false)}
        onSectionSelect={(section) => navigate(`/app/${section}`)}
      >
        <AdminWorkspaceSectionsRenderer
          currentSection={currentSection}
          data={data}
          workspace={workspace}
          users={users}
          organizations={organizations}
          places={places}
          floors={floors}
          reservations={reservations}
          requests={requests}
          search={search}
          roleFilter={roleFilter}
          reservationFilter={reservationFilter}
          onSearchChange={setSearch}
          onRoleFilterChange={setRoleFilter}
          onReservationFilterChange={setReservationFilter}
          onSetDialogState={setDialogState}
          onSetPreviewRequest={setPreviewRequest}
          onNavigate={navigate}
          onOpenConfirm={openConfirm}
          onHandleMutation={handleMutation}
        />
      </AdminWorkspaceShell>

      <AdminWorkspacePageDialogs
        mode={mode}
        workspace={workspace}
        dialogState={dialogState}
        actionPending={actionMutation.isPending}
        previewRequest={previewRequest}
        feedback={feedback}
        onCloseDialog={() => setDialogState(null)}
        onHandleMutation={handleMutation}
        onSetPreviewRequest={setPreviewRequest}
        onSetFeedback={setFeedback}
      />
    </>
  )
}
