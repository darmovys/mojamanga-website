import { createFileRoute } from '@tanstack/react-router'
import { TitleType } from '@/generated/prisma/enums'
import { z } from 'zod'

const titleTypeSchema = z.enum(TitleType)

export const Route = createFileRoute('/catalog')({
  validateSearch: z.object({
    types: z.array(titleTypeSchema).optional().catch(undefined),
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
