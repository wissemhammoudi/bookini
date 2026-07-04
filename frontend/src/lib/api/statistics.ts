import { apiClient } from '../api-client'
import type { ApiResponse } from './common-types'

export type StatisticsSummary = {
  total_reservations: number
  daily_reservations: number
  monthly_reservations: number
  annual_reservations: number
  cancellation_rate: number
  active_users: number
  charts: {
    bar: {
      labels: string[]
      series: number[]
    }
    line: {
      labels: string[]
      series: number[]
    }
    pie: {
      labels: string[]
      series: number[]
    }
  }
}

export type OccupancyMetrics = {
  total_rooms: number
  occupied_rooms: number
  available_rooms: number
  occupancy_percentage: number
  chart: {
    type: string
    labels: string[]
    series: number[]
  }
}

export type NamedChartSeries = {
  items: Array<Record<string, string | number>>
  chart: {
    type: string
    labels: string[]
    series: number[]
  }
}

export const getOccupancyMetrics = async () => {
  const response = await apiClient.get<ApiResponse<OccupancyMetrics>>(
    '/statistics/occupancy',
  )
  return response.data.data
}

export const getStatisticsSummary = async () => {
  const response = await apiClient.get<ApiResponse<StatisticsSummary>>(
    '/statistics/summary',
  )
  return response.data.data
}

export const getMostReservedRooms = async () => {
  const response = await apiClient.get<ApiResponse<NamedChartSeries>>(
    '/statistics/most-reserved-rooms',
  )
  return response.data.data
}

export const getPeakHours = async () => {
  const response = await apiClient.get<ApiResponse<NamedChartSeries>>(
    '/statistics/peak-hours',
  )
  return response.data.data
}
