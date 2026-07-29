'use client'

import React, { useState } from 'react'
import Image from 'next/image'

type ProductGalleryProps = {
  images: string[]
  productName: string
  badge?: string
}

export default function ProductGallery({ images, productName, badge }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transformOrigin: 'center',
    transform: 'scale(1)'
  })
  const [isZooming, setIsZooming] = useState(false)

  // Ensure we have at least one image to display
  const displayImages = images.length > 0 ? images : ['/image.png']

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only zoom on desktop (touch devices don't have hover)
    if (window.innerWidth < 768) return

    setIsZooming(true)
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)' // 200% zoom
    })
  }

  const handleMouseLeave = () => {
    setIsZooming(false)
    setZoomStyle({
      transformOrigin: 'center',
      transform: 'scale(1)'
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      
      {/* Thumbnails (Left on desktop, Bottom on mobile) */}
      {displayImages.length > 1 && (
        <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-auto pb-2 md:pb-0 md:pr-2 scrollbar-hide md:w-[90px] shrink-0">
          {displayImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative w-20 h-24 md:w-full md:h-[110px] shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                activeIndex === index ? "border-emerald shadow-md" : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="90px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div 
        className="order-1 md:order-2 relative w-full aspect-[4/5] rounded-[32px] overflow-hidden shadow-soft border border-gold/15 bg-cream-deep cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={displayImages[activeIndex]}
          alt={`${productName} - Image ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          style={zoomStyle}
          className={`object-cover transition-transform ease-out ${isZooming ? 'duration-100' : 'duration-300'}`}
          priority
        />
        {badge && (
          <span className="absolute top-4 left-4 bg-emerald text-cream text-xs font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full shadow-sm pointer-events-none">
            {badge}
          </span>
        )}
      </div>

    </div>
  )
}
