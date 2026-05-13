'use client'

interface HOKLogoProps {
  size?: number
  className?: string
}

export function HOKLogo({ size = 32, className = '' }: HOKLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={className}
    >
      {/* Vertical bar */}
      <rect x="21" y="3" width="18" height="54" rx="4" fill="currentColor" />
      {/* Horizontal bar */}
      <rect x="3" y="21" width="54" height="18" rx="4" fill="currentColor" />
    </svg>
  )
}
