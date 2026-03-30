import { useEffect } from 'react'

function setOrCreateMeta(attrName, attrValue, content) {
  let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attrName, attrValue)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

function SeoHead({ title, description, canonicalPath, imagePath = '/vite.svg' }) {
  useEffect(() => {
    if (title) document.title = title

    if (description) {
      setOrCreateMeta('name', 'description', description)
      setOrCreateMeta('property', 'og:description', description)
      setOrCreateMeta('name', 'twitter:description', description)
    }

    if (title) {
      setOrCreateMeta('property', 'og:title', title)
      setOrCreateMeta('name', 'twitter:title', title)
    }

    if (canonicalPath) {
      let link = document.querySelector('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', `${window.location.origin}${canonicalPath}`)
      setOrCreateMeta('property', 'og:url', link.getAttribute('href'))
    }
    setOrCreateMeta('property', 'og:type', 'website')
    setOrCreateMeta('property', 'og:image', `${window.location.origin}${imagePath}`)
    setOrCreateMeta('name', 'twitter:card', 'summary_large_image')
    setOrCreateMeta('name', 'twitter:image', `${window.location.origin}${imagePath}`)
  }, [title, description, canonicalPath, imagePath])

  return null
}

export default SeoHead
