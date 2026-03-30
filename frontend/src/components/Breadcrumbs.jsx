import { Link } from 'react-router-dom'

function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-gray-500">
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, idx) => (
          <li key={`${item.label}-${idx}`} className="flex items-center gap-2">
            {idx > 0 && <span>/</span>}
            {item.to ? <Link to={item.to} className="hover:text-gray-800">{item.label}</Link> : <span>{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
