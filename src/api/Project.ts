import Request from '@/utils/request'
import { EnvConfig, EnvConfigName } from '@/types/app/project'

// 获取项目配置
export const getConfigDataAPI = <T>(type: string) => Request<T>("GET", `/config/list/${type}`)

// 修改项目配置
export const editConfigDataAPI = (type: string, data: object) => Request<{ [string: string]: string }>("PATCH", `/config/${type}`, { data })


// 获取环境配置
export const getEnvConfigDataAPI = (name: EnvConfigName) => Request<EnvConfig>("GET", `/env_config/name/${name}`)

// 获取环境配置列表
export const getEnvConfigListAPI = () => Request<EnvConfig[]>("GET", `/env_config/list`)

// 更新环境配置
export const updateEnvConfigDataAPI = (data: EnvConfig) => Request("PATCH", `/env_config/${data.id}/json`, { data: data.value })