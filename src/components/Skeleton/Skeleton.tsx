import React from 'react'
import clsx from 'clsx'
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
  height?: string
  width?: string
  baseColor?: string
  lineHeight?: string
  borderRadius?: string
  className?: string
  style?: React.CSSProperties
}

function Skeleton({
  height,
  width,
  baseColor,
  lineHeight,
  borderRadius,
  className,
  style,
}: SkeletonProps) {
  const cssVars: SkeletonVars = {
    '--height': height ?? '100%',
    '--width': width ?? '100%',
    '--base-color': baseColor,
    '--line-height': lineHeight,
    '--border-radius': borderRadius,
  }

  const mergedStyle: SkeletonStyle = {
    ...cssVars,
    ...style,
  }

  return (
    <div className={clsx(styles.Skeleton, className)} style={mergedStyle} />
  )
}

export default Skeleton
