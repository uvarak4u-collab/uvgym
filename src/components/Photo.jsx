import { useState } from 'react'
import { imageUrl } from '../lib/images'

/**
 * Background photo for a slot (e.g. "hero"). Renders nothing until src/assets/images/<name>.* exists.
 * `className` positions the wrapper; `overlays` are gradient layers that keep text readable in both themes.
 */
export default function Photo({ name, alt = '', className = 'absolute inset-0', imgClassName = '', overlays = [], eager = false }) {
  const src = imageUrl(name)
  const [loaded, setLoaded] = useState(false)
  if (!src) return null

  return (
    <div
      className={`pointer-events-none overflow-hidden transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
      {overlays.map((o) => (
        <div key={o} className={`absolute inset-0 ${o}`} />
      ))}
    </div>
  )
}
