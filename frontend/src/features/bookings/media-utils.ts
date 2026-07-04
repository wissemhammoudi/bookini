const DEFAULT_API_BASE = 'http://localhost:8000/api/v1'

const toApiBase = () => {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' && raw.trim()) {
    return raw.replace(/\/$/, '')
  }

  return import.meta.env.DEV ? DEFAULT_API_BASE : '/api/v1'
}

export const resolveMediaUrl = (value: string | null | undefined): string => {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  if (value.startsWith('/api/v1')) {
    return import.meta.env.DEV ? `http://localhost:8000${value}` : value
  }

  const base = toApiBase()
  return `${base}${value.startsWith('/') ? '' : '/'}${value}`
}

export const toEmbedVideoUrl = (value: string | null | undefined): string => {
  const source = resolveMediaUrl(value)
  if (!source) return ''

  try {
    const parsed = new URL(source)
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}?autoplay=0&rel=0` : source
    }

    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      if (id) {
        return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`
      }

      if (parsed.pathname.includes('/embed/')) {
        return source
      }
    }
  } catch {
    return source
  }

  return source
}
