import { useState } from 'react'
import type { ChapterSection, VideoMeta } from '../types'
import { formatTimestamp, youtubeWatchUrl } from '../utils/formatTime'

interface ChapterChecklistProps {
  video: VideoMeta
  sections: ChapterSection[]
  onToggle: (id: string) => void
  onTitleChange: (id: string, title: string) => void
  onDelete: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onAdd: () => void
  onReset: () => void
}

export function ChapterChecklist({
  video,
  sections,
  onToggle,
  onTitleChange,
  onDelete,
  onReorder,
  onAdd,
  onReset,
}: ChapterChecklistProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const completedCount = sections.filter((s) => s.completed).length

  const handlePrint = () => {
    document.body.classList.add('printing-checklist')
    window.print()
    document.body.classList.remove('printing-checklist')
  }

  const handleDragStart = (id: string) => {
    setDraggedId(id)
  }

  const handleDragOver = (event: React.DragEvent, id: string) => {
    event.preventDefault()
    if (draggedId && draggedId !== id) {
      setDragOverId(id)
    }
  }

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return

    const fromIndex = sections.findIndex((s) => s.id === draggedId)
    const toIndex = sections.findIndex((s) => s.id === targetId)

    if (fromIndex !== -1 && toIndex !== -1) {
      onReorder(fromIndex, toIndex)
    }

    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  return (
    <section className="checklist-panel" id="checklist-print-area">
      <header className="video-header print-header">
        <img
          src={video.thumbnailUrl}
          alt=""
          className="video-thumb no-print"
          width={168}
          height={94}
        />
        <div>
          <h2>{video.title}</h2>
          <p className="progress-label">
            {completedCount} of {sections.length} sections complete
          </p>
          <p className="print-only video-print-url">
            youtube.com/watch?v={video.videoId}
          </p>
        </div>
      </header>

      <ul className="chapter-list" aria-label="Video sections checklist">
        {sections.map((section, index) => (
          <li
            key={section.id}
            className={[
              'chapter-item',
              section.completed ? 'done' : '',
              draggedId === section.id ? 'dragging' : '',
              dragOverId === section.id ? 'drag-over' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDrop={() => handleDrop(section.id)}
            onDragEnd={handleDragEnd}
          >
            <button
              type="button"
              className="drag-handle no-print"
              draggable
              aria-label={`Drag to reorder section ${index + 1}`}
              onDragStart={(e) => {
                const row = e.currentTarget.closest('.chapter-item')
                if (row instanceof HTMLElement) {
                  e.dataTransfer.setDragImage(row, 20, 20)
                }
                e.dataTransfer.effectAllowed = 'move'
                handleDragStart(section.id)
              }}
            >
              ⠿
            </button>

            <label className="chapter-check">
              <input
                type="checkbox"
                checked={section.completed}
                onChange={() => onToggle(section.id)}
              />
              <span className="check-indicator" aria-hidden="true" />
              <span className="print-only print-check">
                {section.completed ? '☑' : '☐'}
              </span>
            </label>

            <div className="chapter-body">
              <input
                type="text"
                className="chapter-title-input screen-only"
                value={section.title}
                onChange={(e) => onTitleChange(section.id, e.target.value)}
                aria-label={`Section ${index + 1} title`}
              />
              <span className="print-only chapter-title-print">
                {section.title}
              </span>
              <a
                className="chapter-time screen-only"
                href={youtubeWatchUrl(video.videoId, section.startMillis)}
                target="_blank"
                rel="noreferrer"
              >
                {formatTimestamp(section.startMillis)}
              </a>
              <span className="print-only chapter-time-print">
                {formatTimestamp(section.startMillis)}
              </span>
            </div>

            <div className="chapter-actions no-print">
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => onDelete(section.id)}
                aria-label="Delete section"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="checklist-toolbar no-print">
        <button type="button" className="secondary-btn" onClick={onAdd}>
          Add section
        </button>
        <button type="button" className="ghost-btn" onClick={onReset}>
          Reset to chapters
        </button>
        <button type="button" className="ghost-btn" onClick={handlePrint}>
          Print / Save PDF
        </button>
      </div>
    </section>
  )
}
