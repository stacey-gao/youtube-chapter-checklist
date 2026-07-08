import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Innertube } from 'youtubei.js'
import { fetchVideoChapters } from '../server/extractChapters.js'
import { parseVideoId } from '../server/parseVideoId.js'

let innertube: Innertube | null = null

async function getInnertube(): Promise<Innertube> {
  if (!innertube) {
    innertube = await Innertube.create()
  }
  return innertube
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const url = typeof req.body?.url === 'string' ? req.body.url : ''
  const videoId = parseVideoId(url)

  if (!videoId) {
    res.status(400).json({ error: 'Invalid YouTube URL or video ID.' })
    return
  }

  try {
    const yt = await getInnertube()
    const result = await fetchVideoChapters(yt, videoId)

    if (result.chapters.length === 0) {
      res.status(404).json({
        error:
          'No chapters found for this video. The uploader may not have added chapter markers.',
        videoId,
        title: result.title,
        thumbnailUrl: result.thumbnailUrl,
      })
      return
    }

    res.status(200).json({
      videoId,
      title: result.title,
      thumbnailUrl: result.thumbnailUrl,
      chapters: result.chapters,
    })
  } catch (error) {
    console.error('Failed to fetch chapters:', error)
    res.status(500).json({
      error: 'Could not load video chapters. Check the URL and try again.',
    })
  }
}
