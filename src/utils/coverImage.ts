export async function fetchCoverImage(sectionKey: string) {
  let cover = ''
  try {
    const coverRes = await fetch('/api/content/section-covers').then(r => r.json())
    if (coverRes?.content) {
      const covers = JSON.parse(coverRes.content)
      if (covers[sectionKey]) cover = covers[sectionKey]
    }
  } catch {}
  if (!cover) {
    try {
      const imgRes = await fetch('/api/banner-images').then(r => r.json())
      if (imgRes.images?.length) {
        // Sort by id for deterministic order
        const sorted = [...imgRes.images].sort((a: any, b: any) => a.id - b.id)
        let hash = 0
        for (let i = 0; i < sectionKey.length; i++) hash = ((hash << 5) - hash) + sectionKey.charCodeAt(i)
        const idx = Math.abs(hash) % sorted.length
        cover = sorted[idx].path
      }
    } catch {}
  }
  return cover
}
