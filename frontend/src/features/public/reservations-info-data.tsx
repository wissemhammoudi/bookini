import SearchIcon from '@mui/icons-material/Search'
import AdsClickIcon from '@mui/icons-material/AdsClick'
import SendIcon from '@mui/icons-material/Send'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import CelebrationIcon from '@mui/icons-material/Celebration'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import CorporateFareIcon from '@mui/icons-material/CorporateFare'
import PersonIcon from '@mui/icons-material/Person'

export type ReservationStep = {
  step: string
  title: string
  desc: string
  icon: React.ReactNode
  color: string
}

export type ReservationRole = {
  role: string
  icon: React.ReactNode
  badge: string
  color: string
  manages: string[]
}

export type ReservationFaq = {
  id: string
  question: string
  answer: string
}

export const reservationSteps: ReservationStep[] = [
  {
    step: 'Step 1',
    title: 'Browse Spaces',
    desc: 'Explore available spaces using filters such as Location, Category, Capacity, and Availability.',
    icon: <SearchIcon sx={{ fontSize: '2rem', color: 'text.primary' }} />,
    color: '#475569',
  },
  {
    step: 'Step 2',
    title: 'Select a Space',
    desc: 'View photos, description, capacity details, standard amenities, and live availability schedules.',
    icon: <AdsClickIcon sx={{ fontSize: '2rem', color: 'text.primary' }} />,
    color: '#334155',
  },
  {
    step: 'Step 3',
    title: 'Submit Reservation',
    desc: 'Choose your desired date, startTime, duration, and submit your reservation request.',
    icon: <SendIcon sx={{ fontSize: '2rem', color: 'text.primary' }} />,
    color: '#1e293b',
  },
  {
    step: 'Step 4',
    title: 'Approval Process',
    desc: 'The space administrator reviews the request. Booking status changes to Pending, Approved, or Rejected.',
    icon: <FactCheckIcon sx={{ fontSize: '2rem', color: 'text.primary' }} />,
    color: '#0f172a',
  },
  {
    step: 'Step 5',
    title: 'Use the Space',
    desc: 'Receive instant email/platform confirmation and enjoy your fully reserved space.',
    icon: <CelebrationIcon sx={{ fontSize: '2rem', color: 'text.primary' }} />,
    color: '#020617',
  },
]

export const reservationRoles: ReservationRole[] = [
  {
    role: 'Super Admin',
    icon: <WorkspacePremiumIcon sx={{ fontSize: '3rem', color: 'text.primary' }} />,
    badge: '👑 Platform Owner',
    color: '#475569',
    manages: ['Platform settings', 'Administrators', 'All reservations', 'Global statistics'],
  },
  {
    role: 'Admin',
    icon: <CorporateFareIcon sx={{ fontSize: '3rem', color: 'text.primary' }} />,
    badge: '🏢 Space Manager',
    color: '#334155',
    manages: ['Places & Locations', 'Specific Spaces & Rooms', 'Reservations & Approvals', 'Availability schedules'],
  },
  {
    role: 'User',
    icon: <PersonIcon sx={{ fontSize: '3rem', color: 'text.primary' }} />,
    badge: '👤 Space Booker',
    color: '#1e293b',
    manages: ['Search spaces', 'Make reservations', 'Track reservation status', 'Manage bookings'],
  },
]

export const reservationFaqs: ReservationFaq[] = [
  {
    id: 'faq1',
    question: 'How do I reserve a space?',
    answer: 'Simply browse the home or booking page, choose the space type and filter that matches your requirements. Select the space, pick your date/time slots, and click submit to trigger a request to the space manager.',
  },
  {
    id: 'faq2',
    question: 'Can I cancel a reservation?',
    answer: 'Yes, reservations can be cancelled directly from your user profile dashboard according to the specific cancellation policy configured for the space.',
  },
  {
    id: 'faq3',
    question: 'How long does approval take?',
    answer: 'Typically, local space managers review requests and provide approval or feedback within 24 hours of submission.',
  },
  {
    id: 'faq4',
    question: 'Can I manage multiple spaces?',
    answer: 'Yes, users with Administrator roles are allowed to configure and manage multiple rooms, amenities, and scheduling calendars across various locations.',
  },
]
