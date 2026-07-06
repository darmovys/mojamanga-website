import React from 'react'
import styles from './Skeleton.module.scss'
import clsx from 'clsx'

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
  height?: string
  width?: string
  baseColor?: string
  lineHeight?: string
  borderRadius?: string
  className?: string
}

function Skeleton({
  height,
  width,
  baseColor,
  lineHeight,
  borderRadius,
  className,
}: SkeletonProps) {
  const style: SkeletonStyle = {
    '--height': height ?? '100%',
    '--width': width ?? '100%',
    '--base-color': baseColor,
    '--line-height': lineHeight,
    '--border-radius': borderRadius,
  }

  return <div className={clsx(styles.Skeleton, className)} style={style} />
}

export default Skeleton
