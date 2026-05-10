/**
 * Sous-titre fiche produit : JSON `{ "subtitle": "..." }` ou première ligne du texte brut.
 */
export function deriveSubtitle(specifications) {
  if (!specifications || typeof specifications !== 'string') return ''
  const trimmed = specifications.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('{')) {
    try {
      const o = JSON.parse(trimmed)
      if (o && typeof o.subtitle === 'string' && o.subtitle.trim()) return o.subtitle.trim()
    } catch {
      /* ignore */
    }
  }
  const line = trimmed.split('\n')[0]
  return line.length > 140 ? `${line.slice(0, 137)}…` : line
}

export function averageRating(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) return null
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
  return sum / reviews.length
}

export function formatMoneyEUR(value, locale) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  const loc = locale === 'en' ? 'en-GB' : 'fr-FR'
  return new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR' }).format(n)
}

/** Entier 0–5 pour affichage ★ / ☆ (évite .repeat(NaN) → crash React). */
export function clampStarRating(rating) {
  const n = Math.round(Number(rating))
  if (!Number.isFinite(n)) return 0
  return Math.min(5, Math.max(0, n))
}
