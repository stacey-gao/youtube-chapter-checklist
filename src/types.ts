export interface ChapterSection {
  id: string
  title: string
  startMillis: number
  completed: boolean
}

export interface VideoMeta {
  videoId: string
  title: string
  thumbnailUrl: string
}

export interface ChaptersResponse extends VideoMeta {
  chapters: Array<{ title: string; startMillis: number }>
}
