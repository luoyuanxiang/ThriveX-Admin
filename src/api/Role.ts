import Request from '@/utils/request'
import { Role } from '@/types/app/role'
import { Route } from '@/types/app/route'
import { Permission } from '@/types/app/permission'

// 新增角色
export const addRoleDataAPI = (data: Role) => Request('POST', '/role', { data })

// 删除角色
export const delRoleDataAPI = (id: number) => Request('DELETE', `/role/${id}`)

// 修改角色
export const editRoleDataAPI = (data: Role) => Request('PATCH', '/role', { data })

// 获取角色
export const getRoleDataAPI = (id: number) => Request<Role>('GET', `/role/${id}`)

// 获取角色列表
export const getRoleListAPI = () => Request<Role[]>('GET', '/role');

// 获取指定角色的路由列表
export const getRoleRouteListAPI = (id: number) => Request<Route[]>('GET', `/role/route/${id}`);

// 获取指定角色的权限列表
export const getRolePermissionListAPI = (id: number) => Request<Permission[]>('GET', `/role/permission/${id}`);

// 给指定角色绑定路由
export const bindingRouteAPI = (id: number, data: { route_ids: number[], permission_ids: number[] }) => Request<Route[]>('PATCH', `/role/bindingRoute/${id}`, { data });