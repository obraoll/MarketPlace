import { useMemo, useState, useEffect } from 'react'

function ProductGallery({ productName, imageUrls, imageUrl, activeImage, onSelectImage, refurbishedLabel }) {
  const images = useMemo(() => {
    const list = Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : []
    if (list.length) return list
    return imageUrl ? [imageUrl] : []
  }, [imageUrls, imageUrl])

  const [imgErr, setImgErr] = useState(false)

  useEffect(() => {
    setImgErr(false)
  }, [activeImage])

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-3xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] ring-1 ring-gray-100 overflow-hidden flex items-center justify-center">
        <span className="absolute top-4 left-4 z-10 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-md">
          {refurbishedLabel}
        </span>
        {activeImage && !imgErr ? (
          <img
            src={activeImage}
            alt={productName}
            loading="eager"
            decoding="async"
            onError={() => setImgErr(true)}
            className="max-h-full max-w-full object-contain p-6 sm:p-8"
          />
        ) : (
          <span className="text-7xl opacity-25" aria-hidden>
            📱
          </span>
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.slice(0, 12).map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => {
                setImgErr(false)
                onSelectImage(img)
              }}
              className={`shrink-0 h-[72px] w-[72px] overflow-hidden rounded-2xl ring-2 transition ${
                activeImage === img ? 'ring-gray-900 ring-offset-2' : 'ring-gray-200 hover:ring-gray-400 ring-offset-2 ring-offset-surface-muted'
              }`}
            >
              <img src={img} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ProductGallery
