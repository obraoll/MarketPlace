function SellerLine({ seller, template, sectionLabel }) {
  if (!seller?.display_name) return null
  const parts = template.split('{name}')
  return (
    <div className="rounded-2xl border border-y border-r border-gray-200 border-l-4 border-l-primary-600 bg-gradient-to-br from-gray-50 to-white py-3.5 pl-4 pr-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">{sectionLabel}</p>
      <p className="text-sm text-gray-700">
        {parts[0]}
        <span className="font-semibold text-gray-900">{seller.display_name}</span>
        {parts[1] ?? ''}
      </p>
    </div>
  )
}

export default SellerLine
