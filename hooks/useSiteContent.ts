'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useSiteContent() {
  const { data, error, isLoading, mutate } = useSWR('/api/content', fetcher, {
    revalidateOnFocus: false, // Don't revalidate every time user switches tabs
  })
  return { data, error, isLoading, mutate }
}
