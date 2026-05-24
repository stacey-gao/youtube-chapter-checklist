import type { Innertube } from 'youtubei.js'

export interface ApiChapter {
  title: string
  startMillis: number
}

function parseTimestampToMillis(timestamp: string): number {
  const parts = timestamp.split(':').map(Number)
  if (parts.some((n) => Number.isNaN(n))) {
    return 0
  }
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts
    return (hours * 3600 + minutes * 60 + seconds) * 1000
  }
  const [minutes, seconds] = parts
  return (minutes * 60 + seconds) * 1000
}

function parseChaptersFromDescription(description: string): ApiChapter[] {
  const chapters: ApiChapter[] = []
  const lines = description.split('\n')

  for (const line of lines) {
    const match = line.trim().match(/^((?:\d{1,2}:)?\d{1,2}:\d{2})\s+(.+)$/)
    if (!match) continue

    chapters.push({
      startMillis: parseTimestampToMillis(match[1]),
      title: match[2].trim(),
    })
  }

  return chapters
}

export async function fetchVideoChapters(
  yt: Innertube,
  videoId: string,
): Promise<{ title: string; thumbnailUrl: string; chapters: ApiChapter[] }> {
  const info = await yt.getBasicInfo(videoId)
  const title = info.basic_info.title ?? 'Untitled video'
  const thumbnailUrl =
    info.basic_info.thumbnail?.[0]?.url ??
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

  const chapters: ApiChapter[] = []
  const bar = info.player_overlays?.decorated_player_bar?.player_bar

  if (bar?.markers_map) {
    for (const marker of bar.markers_map) {
      if (!marker.value?.chapters) continue
      for (const chapter of marker.value.chapters) {
        chapters.push({
          title:
            chapter.title?.toString()?.trim().replace(/^-\s*/, '') ||
            'Untitled section',
          startMillis: chapter.time_range_start_millis ?? 0,
        })
      }
    }
  }

  if (chapters.length === 0) {
    const description = info.basic_info.short_description ?? ''
    chapters.push(...parseChaptersFromDescription(description))
  }

  chapters.sort((a, b) => a.startMillis - b.startMillis)

  return { title, thumbnailUrl, chapters }
}
