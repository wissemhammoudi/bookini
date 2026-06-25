import {
  DashboardSection,
  FloorsSection,
  LogsSection,
  OrganizationsSection,
  PlacesSection,
  RatingsSection,
  RequestsSection,
  ReservationsSection,
  SettingsSection,
  UsersSection,
} from '@/features/admin-workspace/sections'
import type {
  ContactRequestRecord,
  FloorRecord,
  OrganizationRecord,
  PlaceRecord,
  ReservationRecord,
  UserRecord,
} from '@/lib/api-types'
import type { DialogState, ReservationFilter, RoleFilter, SectionKey } from '@/features/admin-workspace/admin-workspace-types'
import type { AdminWorkspaceResponse } from '@/lib/api-types'

type ConfirmOpener = (
  title: string,
  description: string,
  confirmLabel: string,
  onConfirm: () => Promise<void>,
  color?: 'error' | 'primary' | 'warning',
) => void

type MutationHandler = (callback: () => Promise<unknown>, successMessage: string) => Promise<void>

type AdminWorkspaceSectionsRendererProps = {
  currentSection: SectionKey
  data: AdminWorkspaceResponse
  workspace: AdminWorkspaceResponse['collections']
  users: UserRecord[]
  organizations: OrganizationRecord[]
  places: PlaceRecord[]
  floors: FloorRecord[]
  reservations: ReservationRecord[]
  requests: ContactRequestRecord[]
  search: string
  roleFilter: RoleFilter
  reservationFilter: ReservationFilter
  onSearchChange: (value: string) => void
  onRoleFilterChange: (value: RoleFilter) => void
  onReservationFilterChange: (value: ReservationFilter) => void
  onSetDialogState: (value: DialogState) => void
  onSetPreviewRequest: (value: ContactRequestRecord | null) => void
  onNavigate: (path: string) => void
  onOpenConfirm: ConfirmOpener
  onHandleMutation: MutationHandler
}

export const AdminWorkspaceSectionsRenderer = ({
  currentSection,
  data,
  workspace,
  users,
  organizations,
  places,
  floors,
  reservations,
  requests,
  search,
  roleFilter,
  reservationFilter,
  onSearchChange,
  onRoleFilterChange,
  onReservationFilterChange,
  onSetDialogState,
  onSetPreviewRequest,
  onNavigate,
  onOpenConfirm,
  onHandleMutation,
}: AdminWorkspaceSectionsRendererProps) => (
  <>
    {currentSection === 'dashboard' ? <DashboardSection workspaceData={data} /> : null}
    {currentSection === 'users' ? (
      <UsersSection
        users={users}
        organizations={workspace.organizations}
        search={search}
        roleFilter={roleFilter}
        onSearchChange={onSearchChange}
        onRoleFilterChange={onRoleFilterChange}
        onCreateUser={() => onSetDialogState({ type: 'user-create' })}
        onEditUser={(user) => onSetDialogState({ type: 'user-edit', value: user })}
        onToggleUserStatus={(user) => onOpenConfirm(user.status === 'ACTIVE' ? 'Suspend user' : 'Activate user', `This will ${user.status === 'ACTIVE' ? 'suspend' : 'activate'} ${user.full_name}.`, user.status === 'ACTIVE' ? 'Suspend' : 'Activate', () => onHandleMutation(() => updateWorkspaceUserStatus(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'), 'User status updated'), 'warning')}
        onDeleteUser={(user) => onOpenConfirm('Delete user', 'This action permanently removes the user from the admin workspace demo.', 'Delete user', () => onHandleMutation(() => deleteWorkspaceUser(user.id), 'User deleted'), 'error')}
      />
    ) : null}
    {currentSection === 'organizations' ? (
      <OrganizationsSection
        organizations={organizations}
        search={search}
        onSearchChange={onSearchChange}
        onCreateOrganization={() => onSetDialogState({ type: 'organization-create' })}
        onEditOrganization={(organization) => onSetDialogState({ type: 'organization-edit', value: organization })}
        onToggleOrganizationStatus={(organization) => onOpenConfirm(organization.status === 'ACTIVE' ? 'Suspend organization' : 'Activate organization', `This will ${organization.status === 'ACTIVE' ? 'suspend' : 'activate'} ${organization.name}.`, organization.status === 'ACTIVE' ? 'Suspend' : 'Activate', () => onHandleMutation(() => updateWorkspaceOrganizationStatus(organization.id, organization.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'), 'Organization status updated'))}
        onDeleteOrganization={(organization) => onOpenConfirm('Delete organization', 'Deleting an organization also removes related demo users, places, floors, and reservations.', 'Delete organization', () => onHandleMutation(() => deleteWorkspaceOrganization(organization.id), 'Organization deleted'), 'error')}
      />
    ) : null}
    {currentSection === 'places' ? (
      <PlacesSection
        places={places}
        search={search}
        onSearchChange={onSearchChange}
        onCreatePlace={() => onSetDialogState({ type: 'place-create' })}
        onEditPlace={(place) => onSetDialogState({ type: 'place-edit', value: place })}
        onDeletePlace={(place) => onOpenConfirm('Delete place', 'Deleting a place also removes its floors and reservations from the demo dataset.', 'Delete place', () => onHandleMutation(() => deleteWorkspacePlace(place.id), 'Place deleted'), 'error')}
        onViewReservations={() => onNavigate('/app/reservations')}
      />
    ) : null}
    {currentSection === 'floors' ? (
      <FloorsSection
        floors={floors}
        places={workspace.places}
        search={search}
        onSearchChange={onSearchChange}
        onCreateFloor={() => onSetDialogState({ type: 'floor-create' })}
        onEditFloor={(floor) => onSetDialogState({ type: 'floor-edit', value: floor })}
        onDeleteFloor={(floor) => onOpenConfirm('Delete floor', 'This will remove the selected floor and all reservations tied to it in the demo dataset.', 'Delete floor', () => onHandleMutation(() => deleteWorkspaceFloor(floor.id), 'Floor deleted'), 'error')}
      />
    ) : null}
    {currentSection === 'ratings' ? <RatingsSection /> : null}
    {currentSection === 'reservations' ? (
      <ReservationsSection
        reservations={reservations}
        search={search}
        reservationFilter={reservationFilter}
        onSearchChange={onSearchChange}
        onReservationFilterChange={onReservationFilterChange}
        onApprove={(reservation) => onOpenConfirm('Approve reservation', `Approve reservation ${reservation.id} for ${reservation.user_name}.`, 'Approve', () => onHandleMutation(() => updateWorkspaceReservation(reservation.id, 'APPROVED'), 'Reservation approved'))}
        onReject={(reservation) => onOpenConfirm('Reject reservation', `Reject reservation ${reservation.id}.`, 'Reject', () => onHandleMutation(() => updateWorkspaceReservation(reservation.id, 'REJECTED'), 'Reservation rejected'), 'warning')}
        onCancel={(reservation) => onOpenConfirm('Cancel reservation', `Cancel reservation ${reservation.id}.`, 'Cancel reservation', () => onHandleMutation(() => updateWorkspaceReservation(reservation.id, 'CANCELLED'), 'Reservation cancelled'), 'error')}
      />
    ) : null}
    {currentSection === 'requests' ? (
      <RequestsSection
        contactRequests={requests}
        onPreviewMessage={(request) => onSetPreviewRequest(request)}
        onMarkProcessed={(request) => onOpenConfirm('Mark as processed', `Mark ${request.subject} as processed.`, 'Mark processed', () => onHandleMutation(() => updateWorkspaceContactRequest(request.id, 'PROCESSED'), 'Contact request updated'))}
        onDeleteContact={(request) => onOpenConfirm('Delete contact request', 'This removes the request from the demo queue.', 'Delete request', () => onHandleMutation(() => deleteWorkspaceContact(request.id), 'Contact request deleted'), 'error')}
      />
    ) : null}
    {currentSection === 'logs' ? <LogsSection /> : null}
    {currentSection === 'settings' ? <SettingsSection settings={workspace.settings} onEditSettings={() => onSetDialogState({ type: 'settings' })} /> : null}
  </>
)

import {
  deleteWorkspaceContact,
  deleteWorkspaceFloor,
  deleteWorkspaceOrganization,
  deleteWorkspacePlace,
  deleteWorkspaceUser,
  updateWorkspaceContactRequest,
  updateWorkspaceOrganizationStatus,
  updateWorkspaceReservation,
  updateWorkspaceUserStatus,
} from '@/lib/api'
