import type { ReactNode } from 'react'

import CategoryIcon from '@mui/icons-material/Category'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined'
import InfoIcon from '@mui/icons-material/Info'
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import PeopleIcon from '@mui/icons-material/People'
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import SearchIcon from '@mui/icons-material/Search'
import SportsSoccerOutlinedIcon from '@mui/icons-material/SportsSoccerOutlined'
import TouchAppIcon from '@mui/icons-material/TouchApp'
import VerifiedIcon from '@mui/icons-material/Verified'

export type HeroSpace = {
  name: string
  icon: ReactNode
  gradient: string
}

export type CategoryCard = {
  title: string
  icon: ReactNode
  desc: string
}

export type StepCard = {
  num: string
  title: string
  desc: string
}

export type AdvantageCard = {
  title: string
  desc: string
  icon: ReactNode
}

export type TestimonialCard = {
  text: string
  author: string
  role: string
}

export const heroSpaces: HeroSpace[] = [
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

export const categories: CategoryCard[] = [
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

export const steps: StepCard[] = [
  { num: '01', title: 'Search', desc: 'Find spaces that match your needs.' },
  { num: '02', title: 'Reserve', desc: 'Choose a date and submit your reservation.' },
  { num: '03', title: 'Confirm', desc: 'Receive confirmation from the space manager.' },
  { num: '04', title: 'Enjoy', desc: 'Use the space and focus on your activity.' },
]

export const advantages: AdvantageCard[] = [
  {
    title: 'Verified Spaces',
    desc: 'Every space is managed by approved administrators.',
    icon: <VerifiedIcon sx={{ fontSize: '2.25rem' }} />,
  },
  {
    title: 'Easy Reservations',
    desc: 'Reserve in just a few clicks.',
    icon: <TouchAppIcon sx={{ fontSize: '2.25rem' }} />,
  },
  {
    title: 'Transparent Information',
    desc: 'Clear descriptions, photos, and availability.',
    icon: <InfoIcon sx={{ fontSize: '2.25rem' }} />,
  },
  {
    title: 'Multiple Space Types',
    desc: 'From business meetings to events and sports activities.',
    icon: <CategoryIcon sx={{ fontSize: '2.25rem' }} />,
  },
]

export const testimonials: TestimonialCard[] = [
  {
    text: 'Finding a meeting room has never been easier.',
    author: 'Sarah L.',
    role: 'Tech Lead',
  },
  {
    text: 'The reservation process was quick and simple.',
    author: 'Ahmed K.',
    role: 'Event Organizer',
  },
  {
    text: 'Perfect solution for organizing workshops.',
    author: 'Maria S.',
    role: 'Educator',
  },
]

export const searchFields = {
  location: <LocationOnIcon color="action" />,
  spaceType: <CategoryIcon color="action" />,
  date: <CalendarTodayIcon color="action" />,
  capacity: <PeopleIcon color="action" />,
  search: <SearchIcon />,
}
