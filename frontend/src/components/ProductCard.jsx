import { Link } from 'react-router-dom'

const conditionLabels = {
  excellent: 'Excellent',
  bon: 'Bon',
  correct: 'Correct',
}

const conditionColors = {
  excellent: 'bg-gray-100 text-gray-800',
  bon: 'bg-gray-100 text-gray-700',
  correct: 'bg-gray-100 text-gray-600',
}

const badgeLabels = {
  promo: 'Promo',
  bestseller: 'Best-seller',
  reconditionne_certifie: 'Reconditionné certifié',
}

function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="block h-full min-h-0 min-w-0 w-full outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 rounded"
    >
      <div className="card h-full min-h-0 min-w-0 flex flex-col hover:border-gray-300 transition-colors">
        <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center mb-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <span className="text-4xl">📱</span>
          )}
        </div>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 w-fit ${conditionColors[product.condition]}`}>
          {conditionLabels[product.condition]}
        </span>
        {product.badge && (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 w-fit bg-gray-900 text-white">
            {badgeLabels[product.badge] || product.badge}
          </span>
        )}
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <span className="font-semibold text-gray-900">{Number(product.price).toFixed(2)} €</span>
          <span className="text-xs text-gray-500">Stock: {product.stock}</span>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
