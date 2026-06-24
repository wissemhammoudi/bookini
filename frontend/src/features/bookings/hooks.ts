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
    endDate: '',
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
      endDate: '',
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
    bookingDate?: string,
    endDate?: string,
    includedHours?: number,
    additionalRate?: number,
  ): { price: number; originalPrice: number; discount: number; days: number } => {
    if (!startTime || !endTime) {
      return { price: 0, originalPrice: 0, discount: 0, days: 1 }
    }

    const [startHour] = startTime.split(':').map(Number)
    const [endHour] = endTime.split(':').map(Number)
    const hours = Math.max(0, endHour - startHour)

    let days = 1
    if (bookingDate && endDate && endDate !== bookingDate) {
      const start = new Date(bookingDate)
      const end = new Date(endDate)
      const diffTime = end.getTime() - start.getTime()
      if (diffTime >= 0) {
        days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
      }
    }

    let hourlyPrice = hours * roomHourlyRate
    if (planId !== 'pay-as-you-go' && includedHours !== undefined && additionalRate !== undefined) {
      if (hours > includedHours) {
        const additionalHours = hours - includedHours
        hourlyPrice = (includedHours * roomHourlyRate) + (additionalHours * additionalRate)
      } else {
        hourlyPrice = 0
      }
    }

    const originalPrice = hourlyPrice * days
    let discount = 0
    if (days >= 30) {
      discount = 0.50
    } else if (days >= 6) {
      discount = 0.20
    } else if (days >= 3) {
      discount = 0.10
    }

    const price = originalPrice * (1 - discount)

    return {
      price,
      originalPrice,
      discount,
      days,
    }
  }, [])

  return { calculatePrice }
}
