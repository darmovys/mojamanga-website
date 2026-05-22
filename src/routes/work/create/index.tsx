import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/work/create/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div style={{ color: 'var(--sys-on-surface)' }}>
      Вітаємо на сторінці додавання твора!
    </div>
  )
}
