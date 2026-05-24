import { useCallback, useEffect, useState } from 'react'
import { fetchChapters } from './api'
import { ChapterChecklist } from './components/ChapterChecklist'
import type { ChapterSection, VideoMeta } from './types'
import './App.css'

function createId(): string {
  return crypto.randomUUID()
}

function toSections(
  chapters: Array<{ title: string; startMillis: number }>,
): ChapterSection[] {
  return chapters.map((chapter) => ({
    id: createId(),
    title: chapter.title,
    startMillis: chapter.startMillis,
    completed: false,
  }))
}

function loadSavedSections(videoId: string): ChapterSection[] | null {
  const raw = localStorage.getItem(`yt-checklist:${videoId}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ChapterSection[]
  } catch {
    return null
  }
}

function saveSections(videoId: string, sections: ChapterSection[]): void {
  localStorage.setItem(`yt-checklist:${videoId}`, JSON.stringify(sections))
}

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [video, setVideo] = useState<VideoMeta | null>(null)
  const [sections, setSections] = useState<ChapterSection[]>([])
  const [sourceChapters, setSourceChapters] = useState<ChapterSection[]>([])

  useEffect(() => {
    if (!video) return
    saveSections(video.videoId, sections)
  }, [video, sections])

  const loadVideo = useCallback(async () => {
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Enter a YouTube URL.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await fetchChapters(trimmed)
      const meta: VideoMeta = {
        videoId: data.videoId,
        title: data.title,
        thumbnailUrl: data.thumbnailUrl,
      }

      const fromApi = toSections(data.chapters)
      const saved = loadSavedSections(data.videoId)
      const initial = saved ?? fromApi

      setVideo(meta)
      setSourceChapters(fromApi)
      setSections(initial)
    } catch (err) {
      setVideo(null)
      setSections([])
      setSourceChapters([])
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [url])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void loadVideo()
  }

  const updateSections = (updater: (prev: ChapterSection[]) => ChapterSection[]) => {
    setSections(updater)
  }

  return (
    <div className="app">
      <header className="app-header no-print">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ▶
          </span>
          <div>
            <h1>Chapter Checklist</h1>
            <p>Paste a YouTube link and turn its chapters into an editable checklist.</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <form className="url-form no-print" onSubmit={handleSubmit}>
          <label htmlFor="youtube-url">YouTube URL</label>
          <div className="url-row">
            <input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading…' : 'Load chapters'}
            </button>
          </div>
        </form>

        {error && (
          <p className="error-banner no-print" role="alert">
            {error}
          </p>
        )}

        {video && sections.length > 0 && (
          <ChapterChecklist
            video={video}
            sections={sections}
            onToggle={(id) =>
              updateSections((prev) =>
                prev.map((s) =>
                  s.id === id ? { ...s, completed: !s.completed } : s,
                ),
              )
            }
            onTitleChange={(id, title) =>
              updateSections((prev) =>
                prev.map((s) => (s.id === id ? { ...s, title } : s)),
              )
            }
            onDelete={(id) =>
              updateSections((prev) => prev.filter((s) => s.id !== id))
            }
            onReorder={(fromIndex, toIndex) =>
              updateSections((prev) => {
                const next = [...prev]
                const [moved] = next.splice(fromIndex, 1)
                next.splice(toIndex, 0, moved)
                return next
              })
            }
            onAdd={() =>
              updateSections((prev) => [
                ...prev,
                {
                  id: createId(),
                  title: 'New section',
                  startMillis: prev.at(-1)?.startMillis ?? 0,
                  completed: false,
                },
              ])
            }
            onReset={() => setSections(sourceChapters.map((s) => ({ ...s, id: createId() })))}
          />
        )}
      </main>
    </div>
  )
}

export default App
