import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined'
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined'
import SportsSoccerOutlinedIcon from '@mui/icons-material/SportsSoccerOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined'

export type IntroHeroSpace = {
  name: string
  icon: React.ReactNode
  gradient: string
}

export type IntroCategory = {
  title: string
  icon: React.ReactNode
  desc: string
}

export const heroSpaces: IntroHeroSpace[] = [
  {
    name: 'Meeting Rooms',
    icon: <MeetingRoomOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />,
    gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  },
  {
    name: 'Coworking Offices',
    icon: <LaptopMacOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />,
    gradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
  },
  {
    name: 'Event Halls',
    icon: <CelebrationOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />,
    gradient: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
  },
  {
    name: 'Sports Fields',
    icon: <SportsSoccerOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />,
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
  },
  {
    name: 'Training Rooms',
    icon: <SchoolOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />,
    gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
  },
]

export const categories: IntroCategory[] = [
  {
    title: 'Meeting Rooms',
    icon: <MeetingRoomOutlinedIcon sx={{ fontSize: '2rem' }} />,
    desc: 'Professional spaces for private boards and team syncs.',
  },
  {
    title: 'Coworking Spaces',
    icon: <LaptopMacOutlinedIcon sx={{ fontSize: '2rem' }} />,
    desc: 'Flexible hot desks and dedicated offices.',
  },
  {
    title: 'Event Venues',
    icon: <CelebrationOutlinedIcon sx={{ fontSize: '2rem' }} />,
    desc: 'Large halls and creative spaces for gatherings.',
  },
  {
    title: 'Sports Facilities',
    icon: <SportsSoccerOutlinedIcon sx={{ fontSize: '2rem' }} />,
    desc: 'Fields, courts, and training grounds.',
  },
  {
    title: 'Training Rooms',
    icon: <SchoolOutlinedIcon sx={{ fontSize: '2rem' }} />,
    desc: 'Classrooms fully equipped for workshops and lectures.',
  },
  {
    title: 'Private Dining Spaces',
    icon: <RestaurantOutlinedIcon sx={{ fontSize: '2rem' }} />,
    desc: 'Elegant dining rooms for professional lunches.',
  },
]
