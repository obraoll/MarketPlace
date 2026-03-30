import { Link } from 'react-router-dom'
import SeoHead from '../components/SeoHead'

function HomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <SeoHead
        title="Marketplace - Produits reconditionnés"
        description="Achetez des produits reconditionnés testés et garantis par nos vendeurs partenaires."
        canonicalPath="/"
      />
      <div className="text-center py-16">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Achetez malin, achetez reconditionné
        </h1>
        <p className="text-sm text-gray-600 mb-6 max-w-xl mx-auto">
          Découvrez notre sélection de produits reconditionnés de qualité,
          testés et garantis par nos vendeurs partenaires.
        </p>
        <Link
          to="/products"
          className="btn btn-primary text-sm px-5 py-2"
        >
          Découvrir les produits
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 py-12">
        <div className="card text-center">
          <div className="text-3xl mb-3">✅</div>
          <h3 className="font-medium text-gray-900 mb-1">Produits contrôlés</h3>
          <p className="text-sm text-gray-600">
            Chaque produit passe par plus de 30 points de contrôle qualité
          </p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-3">💰</div>
          <h3 className="font-medium text-gray-900 mb-1">Jusqu'à -70%</h3>
          <p className="text-sm text-gray-600">
            Des économies significatives par rapport au neuf
          </p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-3">🌱</div>
          <h3 className="font-medium text-gray-900 mb-1">Écologique</h3>
          <p className="text-sm text-gray-600">
            Participez à l'économie circulaire et réduisez votre impact
          </p>
        </div>
      </div>

      <div className="py-12">
        <h2 className="text-lg font-semibold text-center text-gray-900 mb-8">
          Nos catégories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Smartphones', icon: '📱', category: 'smartphone' },
            { name: 'Ordinateurs', icon: '💻', category: 'ordinateur' },
            { name: 'Tablettes', icon: '📱', category: 'tablette' },
            { name: 'Montres', icon: '⌚', category: 'montre' },
          ].map((cat) => (
            <Link
              key={cat.category}
              to={`/products?category=${cat.category}`}
              className="card text-center hover:border-gray-300 transition-colors"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <h3 className="font-medium text-sm text-gray-900">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>

      <div className="card bg-gray-800 text-white text-center py-10 my-12 border-0">
        <h2 className="text-lg font-semibold mb-2">
          Vous êtes vendeur ?
        </h2>
        <p className="text-sm text-gray-300 mb-4">
          Rejoignez notre marketplace et vendez vos produits reconditionnés
        </p>
        <Link
          to="/register"
          className="inline-block bg-white text-gray-800 text-sm px-5 py-2 rounded border-0 font-medium hover:bg-gray-100 transition-colors"
        >
          Devenir vendeur
        </Link>
      </div>
    </div>
  )
}

export default HomePage
