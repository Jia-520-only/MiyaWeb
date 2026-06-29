import { reactive } from 'vue'

export interface ReaderArticle {
  id: number
  title: string
  word_count?: number
}

export const readerState = reactive({
  articles: [] as ReaderArticle[],
  activeId: null as number | null,
  fontSize: 'md' as 'md' | 'lg' | 'xl',
  progress: 0,
})
