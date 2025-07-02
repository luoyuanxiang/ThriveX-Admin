import { EnvConfig } from '@/types/app/project'
import Request from '@/utils/request'

// 获取项目配置
export const getConfigDataAPI = <T>(type: string) => Request<T>("GET", `/config/list/${type}`)

// 修改项目配置
export const editConfigDataAPI = (type: string, data: object) => Request<{ [string: string]: string }>("PATCH", `/config/${type}`, { data })


// 获取环境配置列表
export const getEnvironmentListAPI = () => Request<EnvConfig[]>("GET", `/env-config/list`)

// 更新环境配置
export const updateEnvironmentAPI = (data: EnvConfig) => Request("PATCH", `/env-config/${data.id}/json`, { data })