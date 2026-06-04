import { Treaty } from '@elysiajs/eden'
import { Api } from './api-client'

export type Person = Treaty.Data<
  Api['people']['people-to-attach']['get']
>[number]
export type Team = Treaty.Data<Api['teams']['teams-to-attach']['get']>[number]
export type Tag = Treaty.Data<Api['tags']['all']['get']>[number]
export type Genre = Treaty.Data<Api['genres']['all']['get']>[number]
