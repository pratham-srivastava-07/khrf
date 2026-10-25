import { useQuery } from '@tanstack/react-query'
import { getAccuracy } from '../api/client'
import type { RangeQuery } from '../types/api'

export function useAccuracy(query: RangeQuery) {
  return useQuery({ queryKey: ['accuracy', query], queryFn: () => getAccuracy(query) })
}
