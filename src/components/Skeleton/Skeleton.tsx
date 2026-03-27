import React from 'react'
import styles from './Skeleton.module.scss'

interface SkeletonVars {
  '--height': string
  '--width': string
  '--base-color'?: string
  '--line-height'?: string
  '--border-radius'?: string
}

// Розширюємо стандартний тип
type SkeletonStyle = React.CSSProperties & SkeletonVars

interface SkeletonProps {
  height: string
  width: string
  baseColor?: string
  lineHeight?: string
  borderRadius?: string
}

function Skeleton({
  height,
  width,
  baseColor,
  lineHeight,
  borderRadius,
}: SkeletonProps) {
  const style: SkeletonStyle = {
    '--height': height,
    '--width': width,
    '--base-color': baseColor,
    '--line-height': lineHeight,
    '--border-radius': borderRadius,
  }

  return <div className={styles.Skeleton} style={style} />
}

export default Skeleton
