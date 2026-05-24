export function formatTimestamp(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => String(n).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${minutes}:${pad(seconds)}`
}

export function youtubeWatchUrl(videoId: string, startMillis: number): string {
  const seconds = Math.floor(startMillis / 1000)
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`
}
