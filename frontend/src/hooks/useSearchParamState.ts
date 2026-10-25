import { useSearchParams } from 'react-router-dom'

/** The current URL search params plus a setter that merges changes (null removes a key). */
export function useSearchParamState() {
  const [search, setSearch] = useSearchParams()

  const update = (changes: Record<string, string | null>) =>
    setSearch(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(changes)) {
          if (value === null) next.delete(key)
          else next.set(key, value)
        }
        return next
      },
      { replace: true },
    )

  return [search, update] as const
}
