import React from 'react'
import styles from './VisuallyHidden.module.scss'

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

const VisuallyHidden = ({ children, ...delegated }: VisuallyHiddenProps) => {
  const [forceShow, setForceShow] = React.useState(false)

  React.useEffect(() => {
    if (import.meta.env.DEV) {
      const handleKeyDown = ({ key }: KeyboardEvent) => {
        if (key === 'Alt') {
          setForceShow(true)
        }
      }

      const handleKeyUp = ({ key }: KeyboardEvent) => {
        if (key === 'Alt') {
          setForceShow(false)
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
      }
    }
  }, [])

  if (forceShow) {
    return children
  }

  return (
    <span className={styles.VisuallyHidden} {...delegated}>
      {children}
    </span>
  )
}

export default VisuallyHidden
