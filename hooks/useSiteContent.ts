'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useSiteContent() {
  const { data, error, isLoading, mutate } = useSWR('/api/content', fetcher, {
    refreshInterval: 2000, // poll every 2 seconds for live updates
    revalidateOnFocus: true,
  })
  return { data, error, isLoading, mutate }
}
