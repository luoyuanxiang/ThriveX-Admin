import Request from '@/utils/request'
import { Route } from '@/types/app/route'

// 新增路由
export const addRouteDataAPI = (data: Route) => Request('POST', '/route', { data })

// 删除路由
export const delRouteDataAPI = (id: number) => Request('DELETE', `/route/${id}`)

// 修改路由
export const editRouteDataAPI = (data: Route) => Request('PATCH', '/route', { data })

// 获取路由
export const getRouteDataAPI = (id?: number) => Request<Route>('GET', `/route/${id}`)

// 获取路由列表
export const getRouteListAPI = () => Request<Route[]>('GET', '/route');