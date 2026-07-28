'use client'

import { useState, useRef, useCallback } from 'react'
import { ChevronsLeftRight } from 'lucide-react'

interface Props {
  label: string
  category: 'dermatology' | 'dental'
  beforeImage?: string
  afterImage?: string
}

export default function BeforeAfterSlider({ label, category, beforeImage, afterImage }: Props) {
  const [sliderPos, setSliderPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100))
    setSliderPos(pct)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    updateSlider(e.clientX)
  }, [dragging, updateSlider])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    updateSlider(e.touches[0].clientX)
  }, [updateSlider])

  // Color themes for placeholder images
  const beforeBg = category === 'dermatology'
    ? 'linear-gradient(135deg, #E8D5C0 0%, #D4B896 100%)'
    : 'linear-gradient(135deg, #D4C5B0 0%, #C0AA90 100%)'

  const afterBg = category === 'dermatology'
    ? 'linear-gradient(135deg, #F0E8DC 0%, #E8D4C0 100%)'
    : 'linear-gradient(135deg, #F4F0EA 0%, #ECE4D8 100%)'

  return (
    <div
      ref={containerRef}
      className="relative h-72 select-none overflow-hidden cursor-ew-resize"
      onMouseMove={handleMouseMove}
      onMouseDown={() => setDragging(true)}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onTouchStart={() => setDragging(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setDragging(false)}
    >
      {/* After (right side — full width base) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={!afterImage ? { background: afterBg } : {}}
      >
        {afterImage ? (
          <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <span className="text-charcoal-muted/40 text-xs font-medium tracking-widest uppercase mb-1">After</span>
            <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
              <span className="font-playfair text-charcoal/30 text-lg">✓</span>
            </div>
            <p className="text-charcoal/20 text-xs mt-2 text-center px-8">{label} Result</p>
          </>
        )}
      </div>

      {/* Before (left side — clipped) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: !beforeImage ? beforeBg : undefined,
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
        }}
      >
        {beforeImage ? (
          <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <span className="text-charcoal-muted/50 text-xs font-medium tracking-widest uppercase mb-1">Before</span>
            <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
              <span className="font-playfair text-charcoal/30 text-lg">◌</span>
            </div>
            <p className="text-charcoal/30 text-xs mt-2 text-center px-8">Before Treatment</p>
          </>
        )}
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <ChevronsLeftRight size={16} className="text-charcoal-muted" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3">
        <span className="bg-charcoal/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">Before</span>
      </div>
      <div className="absolute bottom-3 right-3">
        <span className="bg-gold/80 text-charcoal text-xs px-2 py-1 rounded-md backdrop-blur-sm font-medium">After</span>
      </div>
    </div>
  )
}
