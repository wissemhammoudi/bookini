import { useState, useCallback } from 'react'
import type { BookingFormData } from './types'

/**
 * Hook for managing booking form state
 * Handles form input changes and reset functionality
 */
export const useBookingForm = () => {
  const [formData, setFormData] = useState<BookingFormData>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    participants: '',
    notes: '',
  })

  const handleInputChange = useCallback((field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      bookingDate: '',
      startTime: '',
      endTime: '',
      participants: '',
      notes: '',
    })
  }, [])

  return { formData, handleInputChange, resetForm }
}

/**
 * Hook for calculating booking price based on time and room rate
 */
export const usePriceCalculation = () => {
  const calculatePrice = useCallback((
    roomHourlyRate: number,
    startTime: string,
    endTime: string,
    planId: string,
    includedHours?: number,
    additionalRate?: number,
  ): number => {
    if (!startTime || !endTime) return 0

    const [startHour] = startTime.split(':').map(Number)
    const [endHour] = endTime.split(':').map(Number)
    const hours = Math.max(0, endHour - startHour)

    if (planId === 'pay-as-you-go') {
      return hours * roomHourlyRate
    }

    if (includedHours !== undefined && additionalRate !== undefined) {
      if (hours <= includedHours) {
        return 0
      }
      const additionalHours = hours - includedHours
      return (includedHours * roomHourlyRate) + (additionalHours * additionalRate)
    }

    return hours * roomHourlyRate
  }, [])

  return { calculatePrice }
}
