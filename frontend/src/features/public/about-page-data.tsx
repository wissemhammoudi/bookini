import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import SpeedIcon from '@mui/icons-material/Speed'
import VerifiedIcon from '@mui/icons-material/Verified'
import InfoIcon from '@mui/icons-material/Info'
import HubIcon from '@mui/icons-material/Hub'

export type AboutOffer = {
  title: string
  icon: React.ReactNode
  color: string
  items: string[]
}

export type AboutValue = {
  title: string
  desc: string
  icon: React.ReactNode
}

export const aboutOffers: AboutOffer[] = [
  {
    title: 'For Users',
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: '2.25rem', color: 'text.primary' }} />,
    color: '#475569',
    items: [
      'Easy space discovery',
      'Online reservations',
      'Availability checking',
      'Reservation history',
    ],
  },
  {
    title: 'For Space Managers',
    icon: <BusinessCenterOutlinedIcon sx={{ fontSize: '2.25rem', color: 'text.primary' }} />,
    color: '#334155',
    items: [
      'Space management',
      'Reservation tracking',
      'Availability management',
      'Reservation approvals',
    ],
  },
  {
    title: 'For Administrators',
    icon: <AdminPanelSettingsOutlinedIcon sx={{ fontSize: '2.25rem', color: 'text.primary' }} />,
    color: '#1e293b',
    items: [
      'Facility management',
      'Space organization',
      'User management',
      'Reservation monitoring',
    ],
  },
]

export const aboutValues: AboutValue[] = [
  {
    title: 'Simplicity',
    desc: 'Easy-to-use platform.',
    icon: <SpeedIcon sx={{ fontSize: '2rem', color: 'text.secondary' }} />,
  },
  {
    title: 'Reliability',
    desc: 'Accurate availability and reservation tracking.',
    icon: <VerifiedIcon sx={{ fontSize: '2rem', color: 'text.secondary' }} />,
  },
  {
    title: 'Transparency',
    desc: 'Clear information and reservation processes.',
    icon: <InfoIcon sx={{ fontSize: '2rem', color: 'text.secondary' }} />,
  },
  {
    title: 'Innovation',
    desc: 'Modern tools for managing spaces.',
    icon: <HubIcon sx={{ fontSize: '2rem', color: 'text.secondary' }} />,
  },
]
