import React from 'react'

/**
 * Tooltip component yang tidak break layout
 * Gunakan sebagai wrapper halus di sekitar button/element
 */
export default function Tooltip({ children, title }) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile: gunakan browser native title tooltip
  if (isMobile) {
    return React.cloneElement(children, {
      title: title,
    })
  }

  // Desktop: use data-tooltip attribute yang di-style via CSS global
  return React.cloneElement(children, {
    'data-tooltip': title,
  })
}
