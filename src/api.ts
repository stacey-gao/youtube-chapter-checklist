import type { ChaptersResponse } from './types'

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export async function fetchChapters(url: string): Promise<ChaptersResponse> {
  const response = await fetch(`${apiBase}/api/chapters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to load chapters')
  }

  return data as ChaptersResponse
}
