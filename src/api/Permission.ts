import Request from '@/utils/request'
import { Permission } from '@/types/app/permission'

// 新增权限
export const addPermissionDataAPI = (data: Permission) => Request('POST', '/permission', { data })

// 删除权限
export const delPermissionDataAPI = (id: number) => Request('DELETE', `/permission/${id}`)

// 修改权限
export const editPermissionDataAPI = (data: Permission) => Request('PATCH', '/permission', { data })

// 获取权限
export const getPermissionDataAPI = (id: number) => Request<Permission>('GET', `/permission/${id}`)

// 获取权限列表
export const getPermissionListAPI = () => Request<Permission[]>('GET', '/permission');