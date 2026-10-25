import { useQuery } from '@tanstack/react-query'
import { getTimeseries } from '../api/client'
import type { RangeQuery } from '../types/api'

export function useTimeseries(query: RangeQuery) {
  return useQuery({ queryKey: ['timeseries', query], queryFn: () => getTimeseries(query) })
}
