import cors from 'cors'
import express from 'express'
import { Innertube } from 'youtubei.js'
import { fetchVideoChapters } from './extractChapters.js'
import { parseVideoId } from './parseVideoId.js'

const PORT = Number(process.env.PORT) || 3001

const app = express()
app.use(cors())
app.use(express.json())

let innertube: Innertube | null = null

async function getInnertube(): Promise<Innertube> {
  if (!innertube) {
    innertube = await Innertube.create()
  }
  return innertube
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/chapters', async (req, res) => {
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

    res.json({
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
})

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})
