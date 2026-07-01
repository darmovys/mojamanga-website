import clsx from 'clsx'

interface ShiftByProps {
  x?: number
  y?: number
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

function ShiftBy({ x = 0, y = 0, className, style, children }: ShiftByProps) {
  return (
    <div
      className={clsx(className)}
      style={{
        ...style,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {children}
    </div>
  )
}

export default ShiftBy
