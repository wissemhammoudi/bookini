import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import EventSeatOutlinedIcon from '@mui/icons-material/EventSeatOutlined'
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined'
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'

import type { SectionConfig } from '@/features/admin-workspace/admin-workspace-types'

export const drawerWidth = 296
export const workspaceQueryKey = ['admin-workspace']

export const sections: SectionConfig[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    caption: 'Platform KPIs and activity feed',
    icon: <DashboardOutlinedIcon />,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    key: 'users',
    label: 'User Management',
    caption: 'Create, update, suspend, and search users',
    icon: <GroupOutlinedIcon />,
    roles: ['SUPER_ADMIN'],
  },
  {
    key: 'organizations',
    label: 'Organization Management',
    caption: 'Maintain organization records and status',
    icon: <BusinessOutlinedIcon />,
    roles: ['SUPER_ADMIN'],
  },
  {
    key: 'places',
    label: 'Place Management',
    caption: 'Manage places, pricing, and media',
    icon: <MeetingRoomOutlinedIcon />,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    key: 'floors',
    label: 'Floor Management',
    caption: 'Configure floor plans and zones',
    icon: <LayersOutlinedIcon />,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    key: 'ratings',
    label: 'Ratings & Reviews',
    caption: 'Track admin ratings and space reviews',
    icon: <ReviewsOutlinedIcon />,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    key: 'reservations',
    label: 'Reservation Management',
    caption: 'Review reservation workflow and status',
    icon: <EventSeatOutlinedIcon />,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    key: 'requests',
    label: 'Contact & Partnerships',
    caption: 'Resolve support and partnership requests',
    icon: <MailOutlineOutlinedIcon />,
    roles: ['SUPER_ADMIN'],
  },
  {
    key: 'logs',
    label: 'Audit Logs',
    caption: 'Track user sessions and lifecycle logs',
    icon: <HistoryOutlinedIcon />,
    roles: ['SUPER_ADMIN'],
  },
  {
    key: 'settings',
    label: 'Settings',
    caption: 'Profile, notifications, and security',
    icon: <SettingsOutlinedIcon />,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
]
