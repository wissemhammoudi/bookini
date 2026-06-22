/**
 * Mock data for subscription plans
 * In production, this should come from the API via services/plansService.ts
 */
export const SUBSCRIPTION_PLANS = [
  {
    id: 'pay-as-you-go',
    name: 'Pay-As-You-Go',
    price: 0,
    period: 'per booking',
    hourlyRate: 5,
    features: ['€5 per hour per room', 'No commitment', 'Perfect for one-time bookings'],
    recommended: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 50,
    period: 'per month',
    includedHours: 20,
    additionalHourlyRate: 4,
    features: ['20 hours/month included', '€4 per additional hour', 'Email support'],
    recommended: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 150,
    period: 'per month',
    includedHours: 100,
    additionalHourlyRate: 2,
    features: ['100 hours/month included', '€2 per additional hour', 'Priority support', 'Unlimited bookings'],
    recommended: false,
  },
] as const

/**
 * Mock data for available rooms
 * In production, this should come from the API via services/roomsService.ts
 */
export const AVAILABLE_ROOMS = [
  {
    id: 1,
    name: 'Meeting Room A',
    capacity: 6,
    price: 5,
    amenities: ['WiFi', 'Projector', 'Whiteboard'],
    image: '🏢',
  },
  {
    id: 2,
    name: 'Conference Room B',
    capacity: 12,
    price: 8,
    amenities: ['WiFi', 'Projector', 'Video Call', 'Whiteboard'],
    image: '🏛',
  },
  {
    id: 3,
    name: 'Collaboration Space',
    capacity: 8,
    price: 6,
    amenities: ['WiFi', 'Whiteboard', 'Modular Furniture'],
    image: '🤝',
  },
  {
    id: 4,
    name: 'Executive Suite',
    capacity: 4,
    price: 10,
    amenities: ['WiFi', 'Mini Bar', 'Premium Furniture'],
    image: '🎩',
  },
  {
    id: 5,
    name: 'Training Room',
    capacity: 20,
    price: 12,
    amenities: ['WiFi', 'Projector', 'Video Call', 'Whiteboard', 'AV Equipment'],
    image: '📚',
  },
  {
    id: 6,
    name: 'Creative Studio',
    capacity: 5,
    price: 7,
    amenities: ['WiFi', 'Whiteboard', 'Creative Tools'],
    image: '🎨',
  },
] as const

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[number]
export type Room = typeof AVAILABLE_ROOMS[number]
