import { useQuery } from '@tanstack/react-query'
import { getMeta } from '../api/client'

export function useMeta() {
  return useQuery({ queryKey: ['meta'], queryFn: getMeta })
}
