import { useQuery } from '@tanstack/react-query'
import { getForecast } from '../api/client'
import type { ForecastQuery } from '../types/api'

export function useForecast(query: ForecastQuery) {
  return useQuery({ queryKey: ['forecast', query], queryFn: () => getForecast(query) })
}
