import { useEffect, useMemo, useState } from 'react'

/**
 * Convention JSON pour `product.variants` (tableau d'objets) :
 *
 * 1) Mode groupes : au moins une variante a une clef `group` non vide (ex. "storage", "battery").
 *    - Affichage : un groupe de choix par valeur de `group`.
 *    - Libelle : `label`, ou `name` + `value`, ou `value`, ou `name`.
 *    - Prix : `price_delta` ou `extra_price` (euros ajoutes au prix catalogue de base).
 *    - `price` (nombre) : prix absolu de vente si un seul groupe ; ignore en multi-groupes (preferer price_delta).
 *
 * 2) Mode legacy : aucune clef `group` -> liste plate d'options mutuellement exclusives (meme logique de prix).
 *
 * Si le tableau est vide ou invalide, le composant ne rend rien.
 */
function layoutVariants(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return null
  const cleaned = variants.filter((v) => v && typeof v === 'object')
  if (cleaned.length === 0) return null
  const hasGroup = cleaned.some((v) => v.group != null && String(v.group).trim() !== '')
  if (hasGroup) {
    const groups = {}
    cleaned.forEach((v, i) => {
      const g = String(v.group || '_other').trim() || '_other'
      if (!groups[g]) groups[g] = []
      groups[g].push({ ...v, _i: i })
    })
    return { mode: 'grouped', groups }
  }
  return { mode: 'legacy', options: cleaned }
}

function labelOf(v) {
  if (v.label) return String(v.label)
  if (v.name && v.value) return `${v.name}: ${v.value}`
  if (v.value) return String(v.value)
  if (v.name) return String(v.name)
  return 'Option'
}

function applyVariant(basePrice, currentTotal, variant, multiGroup) {
  if (!variant) return currentTotal
  const pd = variant.price_delta ?? variant.extra_price
  if (pd != null && pd !== '') {
    return currentTotal + (Number(pd) || 0)
  }
  const ap = variant.price
  if (ap != null && ap !== '') {
    const p = Number(ap)
    if (!Number.isFinite(p)) return currentTotal
    if (!multiGroup) return p
  }
  return currentTotal
}

function initialSelections(layout) {
  if (!layout) return {}
  if (layout.mode === 'legacy') {
    const first = layout.options[0]
    return first ? { _legacy: first } : {}
  }
  const sel = {}
  Object.entries(layout.groups).forEach(([key, opts]) => {
    if (opts[0]) sel[key] = opts[0]
  })
  return sel
}

function computeDisplayPrice(basePrice, layout, selections) {
  if (!layout) return basePrice
  if (layout.mode === 'legacy') {
    const v = selections._legacy
    return applyVariant(basePrice, basePrice, v, false)
  }
  const keys = Object.keys(layout.groups)
  const multi = keys.length > 1
  let total = basePrice
  keys.forEach((k) => {
    total = applyVariant(basePrice, total, selections[k], multi)
  })
  return total
}

function summaryLabels(layout, selections, conditionLabel) {
  const parts = [conditionLabel]
  if (!layout) return parts
  if (layout.mode === 'legacy') {
    const v = selections._legacy
    if (v) parts.push(labelOf(v))
    return parts
  }
  Object.keys(layout.groups).forEach((k) => {
    const v = selections[k]
    if (v) parts.push(labelOf(v))
  })
  return parts
}

function ConfiguratorFromVariants({
  variants,
  basePrice,
  conditionLabel,
  onChange,
  pickOptionLabel,
  groupFallbackLabel,
  locale,
}) {
  const layout = useMemo(() => layoutVariants(variants), [variants])
  const [selections, setSelections] = useState(() => initialSelections(layout))

  useEffect(() => {
    setSelections(initialSelections(layout))
  }, [layout, basePrice, variants])

  useEffect(() => {
    if (!onChange) return
    const displayPrice = computeDisplayPrice(basePrice, layout, selections)
    const parts = summaryLabels(layout, selections, conditionLabel)
    onChange({ displayPrice, summaryLine: parts.filter(Boolean).join(' · ') })
  }, [layout, selections, basePrice, conditionLabel, onChange])

  if (!layout) return null

  const setLegacy = (v) => setSelections({ _legacy: v })
  const setGroup = (g, v) => setSelections((prev) => ({ ...prev, [g]: v }))

  const groupHeading = (g) => {
    if (g === '_other') return groupFallbackLabel
    const pretty = g.replace(/_/g, ' ')
    return pretty.charAt(0).toUpperCase() + pretty.slice(1)
  }

  if (layout.mode === 'legacy') {
    return (
      <div className="mb-2 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">{pickOptionLabel}</p>
        <div className="grid gap-2.5">
          {layout.options.map((opt, idx) => {
            const active = selections._legacy === opt
            return (
              <button
                key={opt._i ?? `leg-${idx}`}
                type="button"
                onClick={() => setLegacy(opt)}
                className={`text-left rounded-2xl border-2 px-4 py-3.5 text-sm transition ${
                  active
                    ? 'border-gray-900 bg-gray-900 text-white shadow-md ring-2 ring-gray-900 ring-offset-2'
                    : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <span className={`font-semibold ${active ? 'text-white' : 'text-gray-900'}`}>{labelOf(opt)}</span>
                {(opt.price_delta ?? opt.extra_price) != null && (opt.price_delta ?? opt.extra_price) !== '' ? (
                  <span className={`mt-1 block text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>
                    +{formatMoneyEUR(Number(opt.price_delta ?? opt.extra_price), locale)}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-2 space-y-6">
      {Object.entries(layout.groups).map(([g, opts]) => (
        <div key={g}>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">{groupHeading(g)}</p>
          <div className="flex flex-wrap gap-2">
            {opts.map((opt) => {
              const active = selections[g] === opt
              return (
                <button
                  key={opt._i ?? `${g}-${labelOf(opt)}`}
                  type="button"
                  onClick={() => setGroup(g, opt)}
                  className={`rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
                  }`}
                >
                  {labelOf(opt)}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ConfiguratorFromVariants
