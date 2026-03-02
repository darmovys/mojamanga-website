import { createFileRoute } from '@tanstack/react-router'
import { WorkType } from '@/generated/prisma/enums'
import { z } from 'zod'

const workTypeSchema = z.enum(WorkType)

export const Route = createFileRoute('/catalog')({
  validateSearch: z.object({
    types: z.array(workTypeSchema).optional().catch(undefined),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()

  return (
    <div>
      <h1>Catalog</h1>
      {search.types && search.types.length > 0 ? (
        <p>Selected types: {search.types.join(', ')}</p>
      ) : (
        <p>All types</p>
      )}
    </div>
  )
}
