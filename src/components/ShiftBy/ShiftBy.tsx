interface ShiftByProps {
  x?: number
  y?: number
  children: React.ReactNode
}

function ShiftBy({ x = 0, y = 0, children }: ShiftByProps) {
  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {children}
    </div>
  )
}

export default ShiftBy
