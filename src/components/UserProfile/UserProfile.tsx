import { usersQueries } from '@/services/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/user/$id')

function UserProfile() {
  const { id } = routeApi.useParams()
  const { data } = useSuspenseQuery(usersQueries.getUserInfo(id))
  // TODO
  return <div>{JSON.stringify(data)}</div>
}

export default UserProfile
